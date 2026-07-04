import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * 관리자 결제 관리 목록 - 결제 이력이 있는 요청 전체 (환불 대기 우선 정렬)
 */
export async function GET(_request: NextRequest) {
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

    const { data: payments, error } = await supabaseAdmin
      .from('requests')
      .select(`
        *,
        client:profiles!client_id (id, name, nickname, email),
        ajussi:profiles!ajussi_id (id, name, nickname, email)
      `)
      .in('payment_status', ['PAID', 'REFUND_REQUESTED', 'REFUNDED', 'REFUND_DENIED'])
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { success: false, error: `Failed to fetch payments: ${error.message}` },
        { status: 500 }
      )
    }

    // 환불 대기 건을 최상단으로
    const sorted = (payments || []).sort((a, b) => {
      const aUrgent = a.payment_status === 'REFUND_REQUESTED' ? 0 : 1
      const bUrgent = b.payment_status === 'REFUND_REQUESTED' ? 0 : 1
      return aUrgent - bUrgent
    })

    return NextResponse.json({ success: true, data: sorted })
  } catch (error) {
    console.error('Unexpected error in admin payments API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
