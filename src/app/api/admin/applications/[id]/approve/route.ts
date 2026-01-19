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

    console.log('POST /api/admin/applications/[id]/approve - User:', user?.id)

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

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Application already processed' },
        { status: 400 }
      )
    }

    // Start transaction-like operations
    try {
      // 1. Create ajussi profile
      console.log('Creating ajussi profile for user:', application.user_id)
      console.log('Application data:', application)

      const ajussiProfileData = {
        user_id: application.user_id,
        title: application.title,
        description: application.description,
        hourly_rate: application.hourly_rate,
        available_areas: application.available_areas,
        open_chat_url: application.open_chat_url,
        tags: application.tags,
        is_active: true,
        availability_mask: {}, // 기본값으로 빈 객체 설정
      }

      console.log('Inserting ajussi profile data:', ajussiProfileData)

      const { data: ajussiProfile, error: profileError } = await supabaseAdmin
        .from('ajussi_profiles')
        .insert(ajussiProfileData)
        .select()
        .single()

      if (profileError) {
        console.error('Error creating ajussi profile:', profileError)
        console.error('Profile error details:', profileError.message, profileError.details, profileError.hint)
        return NextResponse.json(
          { success: false, error: `Failed to create ajussi profile: ${profileError.message}` },
          { status: 500 }
        )
      }

      console.log('Ajussi profile created successfully:', ajussiProfile)

      // 2. Update user role to ajussi
      const { error: roleError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'ajussi' })
        .eq('id', application.user_id)

      if (roleError) {
        console.error('Error updating user role:', roleError)
        // Rollback ajussi profile creation
        await supabaseAdmin
          .from('ajussi_profiles')
          .delete()
          .eq('id', ajussiProfile.id)

        return NextResponse.json(
          { success: false, error: 'Failed to update user role' },
          { status: 500 }
        )
      }

      // 3. Update application status
      const { error: updateError } = await supabaseAdmin
        .from('ajussi_applications')
        .update({
          status: 'APPROVED',
          admin_notes: `Approved by admin on ${new Date().toISOString()}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating application status:', updateError)
        // This is less critical, so we don't rollback
      }

      return NextResponse.json({
        success: true,
        message: 'Application approved successfully',
        data: ajussiProfile,
      })
    } catch (error) {
      console.error('Error in approval process:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to approve application' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
