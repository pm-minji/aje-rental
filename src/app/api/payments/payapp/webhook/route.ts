import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWebhook, cancelPayment } from '@/lib/payapp'
import { notify } from '@/lib/notifications'
import { NotificationParty } from '@/lib/notifications/types'
import { Request as RentalRequest } from '@/types/database'

export const dynamic = 'force-dynamic'

/**
 * 페이앱 결제 결과 웹훅 (feedbackurl)
 *
 * 규약:
 * - 정상 처리 시 HTTP 200 + 본문 "SUCCESS" (그 외에는 페이앱이 재시도)
 * - pay_state=1(결제요청 생성)에 SUCCESS를 응답해야 결제가 진행된다 →
 *   결제를 막아야 할 때(이미 결제된 예약 등)는 SUCCESS가 아닌 본문을 반환
 * - 리다이렉트 금지
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const success = () => new NextResponse('SUCCESS', { status: 200, headers: { 'Content-Type': 'text/plain' } })
const block = (reason: string) => new NextResponse(reason, { status: 200, headers: { 'Content-Type': 'text/plain' } })

type RequestWithParties = RentalRequest & {
  client: NotificationParty | null
  ajussi: NotificationParty | null
}

function toNotificationEvent(req: RequestWithParties) {
  return {
    request: {
      id: req.id,
      date: req.date,
      duration: req.duration,
      location: req.location,
      description: req.description,
      deposit_amount: req.deposit_amount,
    },
    client: req.client,
    ajussi: req.ajussi,
  }
}

export async function POST(request: NextRequest) {
  let fields: Record<string, string> = {}
  try {
    const formData = await request.formData()
    formData.forEach((value, key) => {
      fields[key] = String(value)
    })
  } catch (err) {
    console.error('[payapp webhook] failed to parse body:', err)
    return new NextResponse('BAD_REQUEST', { status: 400 })
  }

  if (!verifyWebhook(fields)) {
    console.error('[payapp webhook] verification failed (userid/linkkey/linkval mismatch)')
    return new NextResponse('FORBIDDEN', { status: 403 })
  }

  const supabase = createServerClient()
  const mulNo = fields.mul_no || null
  const payState = parseInt(fields.pay_state || '0', 10)
  const requestId = fields.var1 && UUID_RE.test(fields.var1) ? fields.var1 : null

  // 웹훅 원문 감사 로그 (linkkey/linkval은 저장하지 않는다)
  {
    const { linkkey, linkval, ...safeFields } = fields
    const eventRow = {
      request_id: requestId,
      mul_no: mulNo,
      pay_state: Number.isNaN(payState) ? null : payState,
      raw: safeFields,
    }
    const { error: logErr } = await supabase.from('payment_events').insert(eventRow)
    // request_id가 실제 requests에 없으면 FK 위반 → request_id 없이 원문만이라도 보존
    if (logErr) {
      const { error: retryErr } = await supabase
        .from('payment_events')
        .insert({ ...eventRow, request_id: null })
      if (retryErr) {
        console.error('[payapp webhook] failed to log payment_event:', logErr, retryErr)
      }
    }
  }

  if (!requestId) {
    // var1이 없거나 형식이 다르면 우리 플로우 밖의 결제 - 기록만 하고 종료
    console.error('[payapp webhook] missing/invalid var1 (request id), mul_no:', mulNo)
    return success()
  }

  const { data: req, error: fetchError } = await supabase
    .from('requests')
    .select(`
      *,
      client:profiles!client_id (id, email, name, nickname),
      ajussi:profiles!ajussi_id (id, email, name, nickname)
    `)
    .eq('id', requestId)
    .single()

  if (fetchError || !req) {
    console.error('[payapp webhook] request not found:', requestId, fetchError)
    // 재시도해도 찾을 수 없으므로 ack. payment_events에 원문이 남아 있다.
    return success()
  }

  const typedReq = req as unknown as RequestWithParties
  const nowIso = new Date().toISOString()

  switch (payState) {
    // 결제요청 생성 - mul_no 확보. SUCCESS를 응답해야 결제가 진행된다.
    case 1: {
      if (typedReq.payment_status === 'PAID') {
        // 이미 결제된 예약에 대한 새 결제 시도 차단 + 새 결제요청 무효화
        if (mulNo) {
          await cancelPayment({ mulNo, memo: '이미 결제가 완료된 예약입니다', mode: 'ready' })
        }
        return block('ALREADY_PAID')
      }
      if (['EXPIRED', 'REFUNDED', 'REFUND_DENIED'].includes(typedReq.payment_status) ||
          ['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED'].includes(typedReq.status)) {
        if (mulNo) {
          await cancelPayment({ mulNo, memo: '만료되거나 취소된 예약입니다', mode: 'ready' })
        }
        return block('REQUEST_CLOSED')
      }

      // 재결제 시도면 이전 결제요청 링크 무효화
      if (typedReq.payapp_mul_no && typedReq.payapp_mul_no !== mulNo) {
        await cancelPayment({
          mulNo: typedReq.payapp_mul_no,
          memo: '재결제 시도로 이전 결제요청 무효화',
          mode: 'ready',
        })
      }

      await supabase
        .from('requests')
        .update({ payapp_mul_no: mulNo, payment_status: 'PAYMENT_REQUESTED' })
        .eq('id', requestId)

      return success()
    }

    // 결제완료
    case 4: {
      // 멱등: 같은 mul_no의 재통지는 무시, 다른 mul_no의 결제완료는 중복결제 → 자동 환불
      if (typedReq.payment_status === 'PAID') {
        if (mulNo && typedReq.payapp_mul_no && typedReq.payapp_mul_no !== mulNo) {
          const cancel = await cancelPayment({ mulNo, memo: '중복 결제 자동 취소' })
          if (!cancel.ok) {
            await notify({
              type: 'REFUND_ACTION_NEEDED',
              ...toNotificationEvent(typedReq),
              extra: { refundNote: `중복 결제(mul_no: ${mulNo}) 자동 취소 실패: ${cancel.error}` },
            })
          }
        }
        return success()
      }

      // 결제 금액 검증: 결제창 파라미터(price)는 클라이언트가 정하므로 서버가 저장한
      // deposit_amount와 실제 결제액이 다르면(언더페이먼트 조작) 자동 환불하고 PAID로 인정하지 않는다.
      const paidPrice = Number(fields.price)
      const expectedAmount = typedReq.deposit_amount
      if (expectedAmount != null && (!Number.isFinite(paidPrice) || paidPrice !== expectedAmount)) {
        const cancel = mulNo
          ? await cancelPayment({ mulNo, memo: `결제금액 불일치(${fields.price} != ${expectedAmount}) 자동 환불` })
          : { ok: false, error: 'mul_no missing' }
        await supabase
          .from('requests')
          .update(
            cancel.ok
              ? { payment_status: 'REFUNDED', refund_processed_at: nowIso, payapp_mul_no: mulNo }
              : { payment_status: 'REFUND_REQUESTED', refund_requested_at: nowIso, payapp_mul_no: mulNo }
          )
          .eq('id', requestId)
          .eq('payment_status', 'PAYMENT_REQUESTED')
        await notify({
          type: 'REFUND_ACTION_NEEDED',
          ...toNotificationEvent(typedReq),
          extra: {
            refundNote: `결제금액 불일치(price=${fields.price}, 기대=${expectedAmount}) ${
              cancel.ok ? '자동 환불 완료' : `자동 환불 실패: ${cancel.error}`
            }`,
          },
        })
        // PAID로 절대 마킹하지 않는다. 재시도 방지 위해 ack.
        return success()
      }

      // 만료/취소된 예약에 대한 뒤늦은 결제 → 자동 환불
      if (['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED'].includes(typedReq.status)) {
        const cancel = mulNo
          ? await cancelPayment({ mulNo, memo: '만료/취소된 예약에 대한 결제 자동 환불' })
          : { ok: false, error: 'mul_no missing' }
        await supabase
          .from('requests')
          .update(
            cancel.ok
              ? { payment_status: 'REFUNDED', refund_processed_at: nowIso, payapp_mul_no: mulNo }
              : { payment_status: 'REFUND_REQUESTED', refund_requested_at: nowIso, payapp_mul_no: mulNo }
          )
          .eq('id', requestId)
        if (!cancel.ok) {
          await notify({
            type: 'REFUND_ACTION_NEEDED',
            ...toNotificationEvent(typedReq),
            extra: { refundNote: `만료된 예약의 뒤늦은 결제 환불 실패: ${cancel.error}` },
          })
        }
        return success()
      }

      const payType = fields.pay_type ? parseInt(fields.pay_type, 10) : null
      // paid_at은 웹훅 수신 시각(nowIso, UTC)으로 저장한다.
      // 페이앱 pay_date는 타임존 없는 KST 문자열이라 timestamptz에 그대로 넣으면 9시간 어긋난다.
      const { data: paidUpdate, error: updateError } = await supabase
        .from('requests')
        .update({
          payment_status: 'PAID',
          payapp_mul_no: mulNo,
          pay_type: Number.isNaN(payType) ? null : payType,
          paid_at: nowIso,
        })
        .eq('id', requestId)
        // sweep의 EXPIRED 처리/취소와 레이스 시 결제요청 상태였을 때만 PAID로 전이
        .eq('payment_status', 'PAYMENT_REQUESTED')
        .select('id')

      if (updateError) {
        console.error('[payapp webhook] failed to mark PAID:', updateError)
        // DB 반영 실패 - SUCCESS를 반환하지 않아 페이앱이 재시도하게 한다
        return new NextResponse('DB_ERROR', { status: 500 })
      }

      // 가드에 걸려 0행 갱신 = 이미 만료/취소된 요청. 뒤늦게 승인된 결제이므로 자동 환불한다.
      if (!paidUpdate || paidUpdate.length === 0) {
        const cancel = mulNo
          ? await cancelPayment({ mulNo, memo: '만료/취소된 예약에 대한 결제 자동 환불(레이스)' })
          : { ok: false, error: 'mul_no missing' }
        await supabase
          .from('requests')
          .update(
            cancel.ok
              ? { payment_status: 'REFUNDED', refund_processed_at: nowIso }
              : { payment_status: 'REFUND_REQUESTED', refund_requested_at: nowIso }
          )
          .eq('id', requestId)
          .in('payment_status', ['EXPIRED', 'NONE'])
        if (!cancel.ok) {
          await notify({
            type: 'REFUND_ACTION_NEEDED',
            ...toNotificationEvent(typedReq),
            extra: { refundNote: `레이스로 만료된 예약의 결제 환불 실패: ${cancel.error}` },
          })
        }
        return success()
      }

      // 이 시점에 아저씨에게 "새 요청" 알림이 나간다 (결제 완료 = 예약 신청)
      await notify({ type: 'PAYMENT_COMPLETED', ...toNotificationEvent(typedReq) })
      return success()
    }

    // 요청취소 (미결제 결제요청 취소 통지 - 대부분 우리가 cancelmode=ready로 직접 취소한 건)
    case 8:
    case 32:
      return success()

    // 승인취소 (환불 완료)
    case 9:
    case 64: {
      if (typedReq.payment_status !== 'REFUNDED' && typedReq.payapp_mul_no === mulNo) {
        await supabase
          .from('requests')
          .update({ payment_status: 'REFUNDED', refund_processed_at: nowIso })
          .eq('id', requestId)
        await notify({ type: 'REFUND_COMPLETED', ...toNotificationEvent(typedReq) })
      }
      return success()
    }

    // 가상계좌 대기(10), 부분취소(70/71) 등 - 현재 플로우에서는 기록만
    default:
      return success()
  }
}
