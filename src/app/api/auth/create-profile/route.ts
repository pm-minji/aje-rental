import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Creating profile for user:', user.id)

    const supabase = await createServerSupabase()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('Profile already exists')
      return NextResponse.json({
        success: true,
        data: existingProfile
      })
    }

    // Create new profile
    const profileData = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!,
      profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      role: 'user' as const,
    }

    console.log('Creating profile with data:', profileData)

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('Profile created successfully:', newProfile)

    return NextResponse.json({
      success: true,
      data: newProfile
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
