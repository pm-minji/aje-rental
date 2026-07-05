import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifySale, expectedPermalink, expectedSellerId } from '@/lib/gumroad'
import { notify } from '@/lib/notifications'
import { NotificationParty } from '@/lib/notifications/types'
import { Request as RentalRequest } from '@/types/database'

export const dynamic = 'force-dynamic'

/**
 * Gumroad Ping (판매자 웹훅) — 상품 구매/환불 시 form-encoded POST.
 *
 * Ping은 서명이 없으므로 sale_id를 Gumroad API로 재조회해 진위를 확인한다.
 * 응답은 200이면 충분(그 외에는 Gumroad가 시간당 1회, 최대 3시간 재시도).
 * url_params[request_id]로 예약과 결제를 연결한다.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ok = () => new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })

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
  const fields: Record<string, string> = {}
  try {
    const form = await request.formData()
    form.forEach((value, key) => { fields[key] = String(value) })
  } catch (err) {
    console.error('[gumroad webhook] failed to parse body:', err)
    return new NextResponse('BAD_REQUEST', { status: 400 })
  }

  const saleId = fields.sale_id || null
  const requestId = fields['url_params[request_id]'] && UUID_RE.test(fields['url_params[request_id]'])
    ? fields['url_params[request_id]']
    : null
  const isTest = fields.test === 'true'
  const isRefunded = fields.refunded === 'true'
  const isDisputed = fields.disputed === 'true'
  const pingPermalink = fields.product_permalink || fields.permalink || null

  const supabase = createServerClient()

  // 감사 로그 (원문 보존). request_id가 실제 예약과 안 맞으면 FK 위반 → null로 재기록.
  {
    const eventRow = {
      request_id: requestId,
      mul_no: saleId,
      pay_state: isRefunded ? 9 : (isDisputed ? 8 : 4), // 4=완료, 9=환불, 8=분쟁 (기존 축과 정렬)
      raw: fields,
    }
    const { error: logErr } = await supabase.from('payment_events').insert(eventRow)
    if (logErr) {
      const { error: retryErr } = await supabase
        .from('payment_events')
        .insert({ ...eventRow, request_id: null })
      if (retryErr) console.error('[gumroad webhook] failed to log payment_event:', logErr, retryErr)
    }
  }

  if (!requestId) {
    console.error('[gumroad webhook] missing/invalid url_params[request_id], sale_id:', saleId)
    return ok()
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
    console.error('[gumroad webhook] request not found:', requestId, fetchError)
    return ok()
  }

  const typedReq = req as unknown as RequestWithParties
  const nowIso = new Date().toISOString()

  // 환불/분쟁 통지 → 결제완료였던 건을 REFUNDED로 동기화
  if (isRefunded || isDisputed) {
    if (typedReq.payment_status === 'PAID') {
      await supabase
        .from('requests')
        .update({ payment_status: 'REFUNDED', refund_processed_at: nowIso })
        .eq('id', requestId)
        .eq('payment_status', 'PAID')
      await notify({ type: 'REFUND_COMPLETED', ...toNotificationEvent(typedReq) })
    }
    return ok()
  }

  // 판매(구매완료) 통지
  // 멱등: 이미 PAID면 무시
  if (typedReq.payment_status === 'PAID') return ok()

  // sale_id를 Gumroad API로 재조회해 진위/상품/환불여부 확인 (Ping은 서명이 없음)
  if (!saleId) {
    console.error('[gumroad webhook] missing sale_id')
    return ok()
  }
  const verify = await verifySale(saleId)
  if (verify.ok && verify.data) {
    const sale = verify.data
    const permalink = expectedPermalink()
    if (permalink && sale.product_permalink && sale.product_permalink !== permalink && sale.permalink !== permalink) {
      console.error('[gumroad webhook] product permalink mismatch:', sale.product_permalink, 'expected', permalink)
      return ok()
    }
    if (sale.refunded) {
      console.error('[gumroad webhook] sale already refunded, not marking paid:', saleId)
      return ok()
    }
  } else {
    // 토큰이 없으면 API 검증 불가 → seller_id 대조로 약하게 검증(설정된 경우에만)
    const sellerId = expectedSellerId()
    const pingSeller = fields.seller_id || null
    if (!sellerId || !pingSeller || sellerId !== pingSeller) {
      console.error('[gumroad webhook] cannot verify sale (no token / seller mismatch):', verify.error)
      return ok()
    }
    // 토큰 없이 permalink만이라도 대조
    const permalink = expectedPermalink()
    if (permalink && pingPermalink && pingPermalink !== permalink) {
      console.error('[gumroad webhook] permalink mismatch (no-token path):', pingPermalink)
      return ok()
    }
  }

  // 이미 취소/만료/거절된 예약이면 결제완료로 되돌리지 않는다 (Gumroad는 대시보드에서 수동환불 필요)
  if (['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED'].includes(typedReq.status)) {
    console.error('[gumroad webhook] request not open for payment:', requestId, typedReq.status)
    return ok()
  }

  const { data: paidUpdate, error: updateError } = await supabase
    .from('requests')
    .update({
      payment_status: 'PAID',
      payapp_mul_no: saleId, // 제공자 무관 external ref로 재사용 (Gumroad sale_id)
      paid_at: nowIso,
    })
    .eq('id', requestId)
    .eq('payment_status', 'PAYMENT_REQUESTED')
    .select('id')

  if (updateError) {
    console.error('[gumroad webhook] failed to mark PAID:', updateError)
    return new NextResponse('DB_ERROR', { status: 500 })
  }

  if (paidUpdate && paidUpdate.length > 0) {
    await notify({ type: 'PAYMENT_COMPLETED', ...toNotificationEvent(typedReq) })
  }
  return ok()
}
