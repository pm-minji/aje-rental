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
      .select('id, role, nickname, introduction, profile_image')
      .eq('id', user.id)
      .returns<any>()
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

    // Get ajussi profile if exists (for ajussi or admin roles)
    let ajussiProfile = null
    if ((profile as any).role === 'ajussi' || (profile as any).role === 'admin') {
      const { data, error } = await supabase
        .from('ajussi_profiles')
        .select('title, description, hourly_rate, available_areas, open_chat_url, is_active, tags')
        .eq('user_id', user.id)
        .returns<any>()
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

    // Use admin client to bypass RLS
    const supabaseAdmin = createServerClient()

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

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData as any)
        .eq('id', user.id)

      if (profileError) {
        console.error('API/Profile PUT: Error updating profile:', profileError)
        return NextResponse.json(
          { success: false, error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }

    // Update ajussi profile if provided
    if (ajussiProfileData) {
      // Check if user is ajussi
      const { data: currentProfile, error: roleCheckError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<any>()
        .maybeSingle()

      if (roleCheckError) {
        console.error('API/Profile PUT: Error checking role:', roleCheckError)
      }

      if ((currentProfile as any)?.role !== 'ajussi' && (currentProfile as any)?.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Not authorized to update ajussi profile' },
          { status: 403 }
        )
      }

      // Check if ajussi profile exists
      const { data: existingAjussi, error: checkError } = await supabaseAdmin
        .from('ajussi_profiles')
        .select('id')
        .eq('user_id', user.id)
        .returns<any>()
        .maybeSingle()

      if (checkError) {
        console.error('API/Profile PUT: Error checking existing ajussi profile:', checkError)
      }

      if (existingAjussi) {
        // Update existing
        const { error: ajussiError } = await supabaseAdmin
          .from('ajussi_profiles')
          .update({
            title: ajussiProfileData.title,
            description: ajussiProfileData.description,
            hourly_rate: ajussiProfileData.hourly_rate,
            available_areas: ajussiProfileData.available_areas,
            open_chat_url: ajussiProfileData.open_chat_url,
            is_active: ajussiProfileData.is_active,
            tags: ajussiProfileData.tags,
          } as any)
          .eq('user_id', user.id)

        if (ajussiError) {
          console.error('API/Profile PUT: Error updating ajussi profile:', ajussiError)
          return NextResponse.json(
            { success: false, error: 'Failed to update ajussi profile' },
            { status: 500 }
          )
        }
      } else {
        // Create new
        const { error: ajussiError } = await supabaseAdmin
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
          } as any)

        if (ajussiError) {
          console.error('API/Profile PUT: Error creating ajussi profile:', ajussiError)
          return NextResponse.json(
            { success: false, error: 'Failed to create ajussi profile' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch updated profile data
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .returns<any>()
      .maybeSingle()

    if (fetchError || !updatedProfile) {
      console.error('API/Profile PUT: Error fetching updated profile:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated profile' },
        { status: 500 }
      )
    }

    // Get updated ajussi profile if exists (for ajussi or admin roles)
    let updatedAjussiProfile = null
    if ((updatedProfile as any).role === 'ajussi' || (updatedProfile as any).role === 'admin') {
      const { data, error } = await supabaseAdmin
        .from('ajussi_profiles')
        .select('*')
        .eq('user_id', user.id)
        .returns<any>()
        .maybeSingle()

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
