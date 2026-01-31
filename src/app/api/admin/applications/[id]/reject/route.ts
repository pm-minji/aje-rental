import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('POST /api/admin/applications/[id]/reject - User:', user?.id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS for everything
    const supabaseAdmin = createServerClient()

    // Check if user is admin
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
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get the application
    const { data: application, error: appError } = await supabaseAdmin
      .from('ajussi_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'PENDING' && application.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Application already processed and cannot be rejected' },
        { status: 400 }
      )
    }

    // Start transaction-like operations
    try {
      // 1. Update application status
      const { error: updateError } = await supabaseAdmin
        .from('ajussi_applications')
        .update({
          status: 'REJECTED',
          admin_notes: `Rejected: ${reason} (Date: ${new Date().toISOString()})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // 2. If it was previously approved, we need to revert the user role and deactivate profile
      if (application.status === 'APPROVED') {
        const userId = application.user_id

        // Revert role to user
        const { error: roleError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', userId)

        if (roleError) console.error('Error reverting user role:', roleError)

        // Deactivate ajussi profile (or could delete, but soft delete/deactivate is safer)
        const { error: profileError } = await supabaseAdmin
          .from('ajussi_profiles')
          .update({ is_active: false })
          .eq('user_id', userId)

        if (profileError) console.error('Error deactivating ajussi profile:', profileError)
      }
    } catch (err) {
      console.error('Error rejecting application:', err)
      return NextResponse.json(
        { success: false, error: 'Failed to reject application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
