import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'
import { cancelPayment } from '@/lib/payapp'
import { notify } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/** 취소/환불정책: 예약 24시간 전까지 취소 시 100% 환불 (src/app/refund-policy) */
const REFUND_WINDOW_HOURS = 24

async function getNotifyParties(supabase: Awaited<ReturnType<typeof createServerSupabase>>, requestId: string) {
  const { data } = await supabase
    .from('requests')
    .select(`
      id, date, duration, location, description, deposit_amount,
      client:profiles!client_id (id, email, name, nickname),
      ajussi:profiles!ajussi_id (id, email, name, nickname)
    `)
    .eq('id', requestId)
    .single()
  return data as any
}

export async function PUT(
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

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the request to check permissions
    const { data: existingRequest, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check permissions based on status change
    let canUpdate = false

    if (status === 'CONFIRMED' || status === 'REJECTED') {
      // Only ajussi can confirm or reject
      canUpdate = existingRequest.ajussi_id === user.id
    } else if (status === 'CANCELLED') {
      // Only client can cancel
      canUpdate = existingRequest.client_id === user.id
    } else if (status === 'COMPLETED') {
      // Both client and ajussi can mark as completed
      canUpdate = existingRequest.client_id === user.id || existingRequest.ajussi_id === user.id
    }

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this request' },
        { status: 403 }
      )
    }

    // Check if status transition is valid
    const currentStatus = existingRequest.status
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'REJECTED': [],
      'COMPLETED': [],
      'CANCELLED': [],
      'EXPIRED': [],
    }

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      )
    }

    // 결제 가드: 결제 완료된 요청만 수락/완료 가능 (NONE = 결제 도입 이전 데이터는 허용)
    const paidOrLegacy = ['PAID', 'NONE'].includes(existingRequest.payment_status)
    if ((status === 'CONFIRMED' || status === 'COMPLETED') && !paidOrLegacy) {
      return NextResponse.json(
        { success: false, error: '결제가 완료된 요청만 처리할 수 있습니다' },
        { status: 400 }
      )
    }

    // 결제 후속 처리 (거절/취소 시 자동 환불)
    const nowIso = new Date().toISOString()
    const paymentUpdate: Record<string, any> = {}
    let refundNote: string | undefined
    let refundFailure: string | undefined

    const fullRefund = async (memo: string) => {
      if (!existingRequest.payapp_mul_no) {
        return { ok: false, error: 'payapp_mul_no missing' }
      }
      return cancelPayment({ mulNo: existingRequest.payapp_mul_no, memo })
    }

    const applyRefundResult = (cancel: { ok: boolean; error?: string }) => {
      if (cancel.ok) {
        paymentUpdate.payment_status = 'REFUNDED'
        paymentUpdate.refund_processed_at = nowIso
        refundNote = '결제하신 예약금은 전액 환불 처리되었습니다.'
      } else {
        paymentUpdate.payment_status = 'REFUND_REQUESTED'
        paymentUpdate.refund_requested_at = nowIso
        refundNote = '환불 자동 처리에 실패해 관리자가 확인 중입니다. 처리되는 대로 알려드릴게요.'
        refundFailure = cancel.error
      }
    }

    if (status === 'REJECTED' && existingRequest.payment_status === 'PAID') {
      applyRefundResult(await fullRefund('아저씨 거절로 전액 환불'))
    }

    // 결제 완료 여부 - 취소 알림/후속 처리 분기에 사용 (아저씨는 결제 완료된 요청만 봤다)
    const wasPaid = existingRequest.payment_status === 'PAID'

    if (status === 'CANCELLED') {
      if (existingRequest.payment_status === 'PAYMENT_REQUESTED') {
        // 미결제 취소: 열려 있는 결제요청 무효화.
        // payment_status는 PAYMENT_REQUESTED로 유지해 아저씨 목록(결제완료 건만 노출)에서 계속 숨긴다.
        if (existingRequest.payapp_mul_no) {
          await cancelPayment({
            mulNo: existingRequest.payapp_mul_no,
            memo: '요청 취소로 결제요청 무효화',
            mode: 'ready',
          })
        }
      } else if (existingRequest.payment_status === 'PAID') {
        const hoursUntilService =
          (new Date(existingRequest.date).getTime() - Date.now()) / (60 * 60 * 1000)
        // 아저씨 수락 전(PENDING)에는 언제든 전액 환불, 확정 후에는 예약 24시간 전까지 전액 환불
        const refundable =
          existingRequest.status === 'PENDING' || hoursUntilService >= REFUND_WINDOW_HOURS

        if (refundable) {
          applyRefundResult(
            await fullRefund(
              existingRequest.status === 'PENDING'
                ? '아저씨 수락 전 취소 - 전액 환불'
                : '예약 24시간 전 취소 - 전액 환불'
            )
          )
        } else {
          paymentUpdate.payment_status = 'REFUND_DENIED'
          refundNote = '예약 24시간 이내 취소는 취소/환불정책에 따라 환불이 불가합니다.'
        }
      }
    }

    // Update the request - 낙관적 동시성 가드(compare-and-swap):
    // 읽은 시점의 status/payment_status가 그대로일 때만 갱신한다.
    // (결제 완료 웹훅·sweep 만료·상대방 액션과 레이스 시 결제금 유실/모순 상태 방지)
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({ status, ...paymentUpdate })
      .eq('id', id)
      .eq('status', currentStatus)
      .eq('payment_status', existingRequest.payment_status)
      .select(`
        *,
        client:profiles!client_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi:profiles!ajussi_id (
          id,
          name,
          nickname,
          profile_image
        )
      `)
      .maybeSingle()

    if (updateError) {
      console.error('Error updating request:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // 0행 갱신 = 그 사이 상태가 바뀜(동시 결제/취소/만료). 클라이언트에 새로고침 유도.
    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: '요청 상태가 변경되었습니다. 새로고침 후 다시 시도해주세요.' },
        { status: 409 }
      )
    }

    // 알림 발송 (실패해도 본 응답에 영향 없음)
    const parties = await getNotifyParties(supabase, id)
    if (parties) {
      const base = { request: parties, client: parties.client, ajussi: parties.ajussi }
      if (status === 'CONFIRMED') {
        await notify({ type: 'REQUEST_ACCEPTED', ...base })
      } else if (status === 'REJECTED') {
        await notify({ type: 'REQUEST_REJECTED', ...base, extra: { refundNote } })
      } else if (status === 'CANCELLED' && wasPaid) {
        // 미결제 요청은 아저씨가 본 적 없으므로 취소 알림을 보내지 않는다
        await notify({ type: 'REQUEST_CANCELLED', ...base, extra: { refundNote } })
      }
      if (refundFailure) {
        await notify({
          type: 'REFUND_ACTION_NEEDED',
          ...base,
          extra: { refundNote: `상태 변경(${status}) 중 자동 환불 실패: ${refundFailure}` },
        })
      }
    }

    // Get ajussi_profiles for the updated request
    if (updatedRequest) {
      const { data: ajussiProfile } = await supabase
        .from('ajussi_profiles')
        .select('user_id, id, title, hourly_rate, open_chat_url')
        .eq('user_id', updatedRequest.ajussi_id)
        .single()

      const requestWithProfile = {
        ...updatedRequest,
        ajussi_profiles: ajussiProfile || null
      }

      return NextResponse.json({
        success: true,
        data: requestWithProfile,
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = await createServerSupabase()

    const { data: requestData, error } = await supabase
      .from('requests')
      .select(`
        *,
        client:profiles!client_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi:profiles!ajussi_id (
          id,
          name,
          nickname,
          profile_image
        )
      `)
      .eq('id', id)
      .or(`client_id.eq.${user.id},ajussi_id.eq.${user.id}`)
      .single()

    if (error || !requestData) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Get ajussi_profiles for the request
    const { data: ajussiProfile } = await supabase
      .from('ajussi_profiles')
      .select('user_id, id, title, hourly_rate, open_chat_url')
      .eq('user_id', requestData.ajussi_id)
      .single()

    const requestWithProfile = {
      ...requestData,
      ajussi_profiles: ajussiProfile || null
    }

    return NextResponse.json({
      success: true,
      data: requestWithProfile,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
