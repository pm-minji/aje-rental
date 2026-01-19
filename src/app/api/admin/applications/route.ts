import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Admin Applications API Called ===')

    // Try to get user from session directly
    const supabase = await createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('User from session:', user?.id, 'Error:', userError)

    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS for role check and fetching applications
    const supabaseAdmin = createServerClient()

    // Check if user is admin
    console.log('Checking admin role for user:', user.id)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    console.log('Profile data:', profile, 'Error:', profileError)

    if (!profile || profile.role !== 'admin') {
      console.log('User is not admin, role:', profile?.role)
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('Admin access confirmed, fetching applications...')

    // Get all applications with user info
    const { data: applications, error } = await supabaseAdmin
      .from('ajussi_applications')
      .select(`
        *,
        user:profiles!user_id (
          id,
          name,
          nickname,
          email
        )
      `)
      .order('created_at', { ascending: false })

    console.log('Applications query result:', applications, 'Error:', error)

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { success: false, error: `Failed to fetch applications: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Returning applications:', applications?.length || 0)
    return NextResponse.json({
      success: true,
      data: applications || [],
    })
  } catch (error) {
    console.error('Unexpected error in admin applications API:', error)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
