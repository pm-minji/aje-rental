import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServerClient, getUser } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS
    const supabase = createServerClient()

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get ajussi profile if exists
    let ajussiProfile = null
    if (profile.role === 'ajussi') {
      const { data, error } = await supabase
        .from('ajussi_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error) {
        ajussiProfile = data
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        ajussiProfile,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profile: profileData, ajussiProfile: ajussiProfileData } = body

    const supabase = await createServerSupabase()

    // Update main profile
    if (profileData) {
      const updateData: any = {
        nickname: profileData.nickname,
        introduction: profileData.introduction,
        profile_image: profileData.profile_image,
      }

      // Allow role change only from user to ajussi
      if (profileData.role === 'ajussi') {
        updateData.role = 'ajussi'
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return NextResponse.json(
          { success: false, error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }

    // Update ajussi profile if provided
    if (ajussiProfileData) {
      // Check if user is ajussi
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (currentProfile?.role !== 'ajussi') {
        return NextResponse.json(
          { success: false, error: 'Not authorized to update ajussi profile' },
          { status: 403 }
        )
      }

      // Check if ajussi profile exists
      const { data: existingAjussi } = await supabase
        .from('ajussi_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingAjussi) {
        // Update existing
        const { error: ajussiError } = await supabase
          .from('ajussi_profiles')
          .update({
            title: ajussiProfileData.title,
            description: ajussiProfileData.description,
            hourly_rate: ajussiProfileData.hourly_rate,
            available_areas: ajussiProfileData.available_areas,
            open_chat_url: ajussiProfileData.open_chat_url,
            is_active: ajussiProfileData.is_active,
            tags: ajussiProfileData.tags,
          })
          .eq('user_id', user.id)

        if (ajussiError) {
          console.error('Error updating ajussi profile:', ajussiError)
          return NextResponse.json(
            { success: false, error: 'Failed to update ajussi profile' },
            { status: 500 }
          )
        }
      } else {
        // Create new
        const { error: ajussiError } = await supabase
          .from('ajussi_profiles')
          .insert({
            user_id: user.id,
            title: ajussiProfileData.title,
            description: ajussiProfileData.description,
            hourly_rate: ajussiProfileData.hourly_rate,
            available_areas: ajussiProfileData.available_areas || [],
            open_chat_url: ajussiProfileData.open_chat_url,
            is_active: ajussiProfileData.is_active ?? true,
            tags: ajussiProfileData.tags || [],
          })

        if (ajussiError) {
          console.error('Error creating ajussi profile:', ajussiError)
          return NextResponse.json(
            { success: false, error: 'Failed to create ajussi profile' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch updated profile data
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated profile:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated profile' },
        { status: 500 }
      )
    }

    // Get updated ajussi profile if exists
    let updatedAjussiProfile = null
    if (updatedProfile.role === 'ajussi') {
      const { data, error } = await supabase
        .from('ajussi_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error) {
        updatedAjussiProfile = data
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updatedProfile,
        ajussiProfile: updatedAjussiProfile,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
