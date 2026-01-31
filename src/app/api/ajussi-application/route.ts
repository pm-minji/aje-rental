import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Try to get user from session directly
    const supabase = await createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('POST /api/ajussi-application - User:', user?.id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      hourly_rate,
      available_areas,
      open_chat_url,
      tags,
      real_name,
      birth_date,
      phone_number,
      career_history,
      specialties
    } = body

    // Validate required fields
    if (
      !title || !description || !hourly_rate || !available_areas || !open_chat_url ||
      !real_name || !birth_date || !phone_number || !career_history
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has ajussi profile
    const { data: existingProfile } = await supabase
      .from('ajussi_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Already registered as ajussi' },
        { status: 400 }
      )
    }

    // Create ajussi application (pending approval)
    const { data: application, error: applicationError } = await supabase
      .from('ajussi_applications')
      .insert({
        user_id: user.id,
        title,
        description,
        hourly_rate: parseInt(hourly_rate),
        available_areas,
        open_chat_url,
        tags,
        status: 'PENDING', // Waiting for admin approval
        real_name,
        birth_date,
        phone_number,
        career_history,
        specialties: specialties || [],
      })
      .select()
      .single()

    if (applicationError) {
      console.error('Error creating ajussi application:', applicationError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. We will review and contact you soon.',
      data: application,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
