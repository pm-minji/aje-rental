import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServerClient } from '@/lib/supabase'
import { cancelPayment } from '@/lib/payapp'
import { refundSale } from '@/lib/gumroad'
import { getPaymentProvider } from '@/lib/payment-provider'
import { notify } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * 관리자 환불 처리
 * body: { action: 'refund' | 'deny', amount?: number (부분환불 원, 미지정 시 전액), note?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createServerClient()

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { action, amount, note } = body as {
      action: 'refund' | 'deny'
      amount?: number
      note?: string
    }

    if (!['refund', 'deny'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    const { data: req, error: fetchError } = await supabaseAdmin
      .from('requests')
      .select(`
        *,
        client:profiles!client_id (id, email, name, nickname),
        ajussi:profiles!ajussi_id (id, email, name, nickname)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !req) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    if (!['PAID', 'REFUND_REQUESTED', 'REFUND_DENIED'].includes(req.payment_status)) {
      return NextResponse.json(
        { success: false, error: `현재 결제 상태(${req.payment_status})에서는 처리할 수 없습니다` },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()

    if (action === 'deny') {
      await supabaseAdmin
        .from('requests')
        .update({
          payment_status: 'REFUND_DENIED',
          admin_payment_note: note || null,
        })
        .eq('id', id)

      return NextResponse.json({ success: true })
    }

    // action === 'refund'
    if (!req.payapp_mul_no) {
      return NextResponse.json(
        { success: false, error: '페이앱 결제번호(mul_no)가 없어 환불할 수 없습니다' },
        { status: 400 }
      )
    }

    // 부분환불 여부 판정: amount가 지정되고 결제액보다 작으면 부분환불
    const paidAmount = req.deposit_amount ?? 0
    const isPartial = !!amount && amount > 0 && amount < paidAmount

    // 제공자별 외부 환불 실행
    let cancel: { ok: boolean; error?: string }
    if (getPaymentProvider() === 'gumroad') {
      if (isPartial) {
        // Gumroad 부분환불은 통화·금액 매핑이 모호하므로 대시보드에서 처리하도록 안내
        return NextResponse.json(
          { success: false, error: 'Gumroad 부분환불은 Gumroad 대시보드에서 처리해주세요. 여기서는 전액 환불만 지원합니다.' },
          { status: 400 }
        )
      }
      cancel = await refundSale(req.payapp_mul_no)
    } else {
      cancel = await cancelPayment({
        mulNo: req.payapp_mul_no,
        memo: note || '관리자 환불 처리',
        partAmount: isPartial ? amount : undefined,
      })
    }

    if (!cancel.ok) {
      return NextResponse.json(
        { success: false, error: `환불 실패: ${cancel.error}` },
        { status: 502 }
      )
    }

    // 부분환불이면 아직 잔액이 남아 있으므로 PAID 유지(추가 부분환불 가능),
    // 전액환불일 때만 REFUNDED로 확정한다.
    await supabaseAdmin
      .from('requests')
      .update({
        ...(isPartial
          ? { payment_status: 'PAID' }
          : { payment_status: 'REFUNDED', refund_processed_at: nowIso }),
        admin_payment_note: note
          ? isPartial ? `[부분환불 ${amount.toLocaleString()}원] ${note}` : note
          : null,
      })
      .eq('id', id)

    // 전액환불 시에만 환불 완료 알림 발송
    if (!isPartial) {
      await notify({
        type: 'REFUND_COMPLETED',
        request: req as any,
        client: (req as any).client,
        ajussi: (req as any).ajussi,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in admin refund API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
