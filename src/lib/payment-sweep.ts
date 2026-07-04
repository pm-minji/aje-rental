import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { cancelPayment } from '@/lib/payapp'
import { notify } from '@/lib/notifications'
import { PAYMENT_EXPIRE_HOURS } from '@/lib/pricing'

const SWEEP_SELECT = `
  id, date, duration, location, description, deposit_amount, payapp_mul_no, payment_status, status,
  client:profiles!client_id (id, email, name, nickname),
  ajussi:profiles!ajussi_id (id, email, name, nickname)
`

/**
 * 결제 만료 lazy sweep - 목록 조회 시점에 실행된다 (Vercel Hobby cron은 일 1회라 부정확).
 *
 * 1) 미결제(PAYMENT_REQUESTED) 요청이 생성 후 24시간 경과 또는 예약시각 도래 → EXPIRED + 결제요청 무효화
 * 2) 결제됐지만(PAID) 아저씨 미수락 상태로 예약시각 경과 → 전액 자동환불 + EXPIRED
 *
 * 실패해도 호출부(목록 조회)를 깨지 않도록 절대 throw하지 않는다.
 */
export async function sweepExpiredPayments(supabase: SupabaseClient<Database>): Promise<void> {
  try {
    const now = new Date()
    const nowIso = now.toISOString()
    const cutoffIso = new Date(now.getTime() - PAYMENT_EXPIRE_HOURS * 60 * 60 * 1000).toISOString()

    // 1) 미결제 만료
    // limit으로 1회 호출당 처리량을 제한한다. 남은 건은 다음 조회 때 처리되므로,
    // 만료 건이 대량 누적돼도 목록 API가 외부 취소 API 호출로 오래 블로킹되지 않는다.
    const { data: unpaidExpired } = await supabase
      .from('requests')
      .select(SWEEP_SELECT)
      .eq('status', 'PENDING')
      .eq('payment_status', 'PAYMENT_REQUESTED')
      .or(`created_at.lt.${cutoffIso},date.lt.${nowIso}`)
      .limit(20)

    for (const req of (unpaidExpired as any[]) || []) {
      // 웹훅(PAID)과의 레이스 방지: 여전히 미결제일 때만 만료 처리
      const { data: updated } = await supabase
        .from('requests')
        .update({ status: 'EXPIRED', payment_status: 'EXPIRED' })
        .eq('id', req.id)
        .eq('status', 'PENDING')
        .eq('payment_status', 'PAYMENT_REQUESTED')
        .select('id')

      if (!updated || updated.length === 0) continue

      if (req.payapp_mul_no) {
        await cancelPayment({
          mulNo: req.payapp_mul_no,
          memo: '기한 내 미결제로 요청 만료',
          mode: 'ready',
        })
      }
      await notify({
        type: 'PAYMENT_EXPIRED',
        request: req,
        client: req.client,
        ajussi: req.ajussi,
      })
    }

    // 2) 결제 완료 + 아저씨 미수락 상태로 예약시각 경과 → 전액 환불
    const { data: paidStale } = await supabase
      .from('requests')
      .select(SWEEP_SELECT)
      .eq('status', 'PENDING')
      .eq('payment_status', 'PAID')
      .lt('date', nowIso)
      .limit(20)

    for (const req of (paidStale as any[]) || []) {
      // 환불 API를 부르기 전에 CAS로 행을 먼저 선점한다.
      // payment_status를 PAID → REFUND_REQUESTED로 옮기므로, 동시에 도는 다른 sweep이나
      // 아저씨 수락 PUT은 이 행을 더 이상 PAID로 보지 못해 이중 환불/모순 상태가 생기지 않는다.
      const { data: claimed } = await supabase
        .from('requests')
        .update({
          status: 'EXPIRED',
          payment_status: 'REFUND_REQUESTED',
          refund_requested_at: nowIso,
        })
        .eq('id', req.id)
        .eq('status', 'PENDING')
        .eq('payment_status', 'PAID')
        .select('id')

      if (!claimed || claimed.length === 0) continue // 다른 프로세스가 선점

      // 선점 성공 후에만 실제 환불을 실행한다
      const cancel = req.payapp_mul_no
        ? await cancelPayment({
            mulNo: req.payapp_mul_no,
            memo: '아저씨 미수락으로 예약 만료 - 전액 환불',
          })
        : { ok: false, error: 'payapp_mul_no missing' }

      if (cancel.ok) {
        await supabase
          .from('requests')
          .update({ payment_status: 'REFUNDED', refund_processed_at: nowIso })
          .eq('id', req.id)
      }

      await notify({
        type: 'REQUEST_REJECTED',
        request: req,
        client: req.client,
        ajussi: req.ajussi,
        extra: {
          refundNote: cancel.ok
            ? '아저씨가 기한 내 수락하지 못해 예약금이 전액 환불 처리되었습니다.'
            : '환불 자동 처리에 실패해 관리자가 확인 중입니다. 처리되는 대로 알려드릴게요.',
        },
      })
      if (!cancel.ok) {
        await notify({
          type: 'REFUND_ACTION_NEEDED',
          request: req,
          client: req.client,
          ajussi: req.ajussi,
          extra: { refundNote: `미수락 만료 자동 환불 실패: ${cancel.error}` },
        })
      }
    }
  } catch (err) {
    console.error('[payment-sweep] failed:', err)
  }
}
