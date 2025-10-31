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

    const body = await request.json()
    const { ajussiId } = body

    if (!ajussiId) {
      return NextResponse.json(
        { success: false, error: 'Ajussi ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Check if ajussi exists
    const { data: ajussi, error: ajussiError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', ajussiId)
      .eq('role', 'ajussi')
      .single()

    if (ajussiError || !ajussi) {
      return NextResponse.json(
        { success: false, error: 'Ajussi not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ajussi_id', ajussiId)
      .single()

    if (existing) {
      // If already favorited, remove it (toggle off)
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ajussi_id', ajussiId)

      if (deleteError) {
        console.error('Error removing from favorites:', deleteError)
        return NextResponse.json(
          { success: false, error: 'Failed to remove from favorites' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Removed from favorites',
      })
    }

    // Add to favorites (toggle on)
    const { data: favorite, error: favoriteError } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        ajussi_id: ajussiId,
      })
      .select()
      .single()

    if (favoriteError) {
      console.error('Error adding favorite:', favoriteError)
      return NextResponse.json(
        { success: false, error: 'Failed to add favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: 'added',
      data: favorite,
      message: 'Added to favorites',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ajussiId = searchParams.get('ajussiId')

    if (!ajussiId) {
      return NextResponse.json(
        { success: false, error: 'Ajussi ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('ajussi_id', ajussiId)

    if (error) {
      console.error('Error removing favorite:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite removed',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabase()

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        ajussi_profile:ajussi_profiles!ajussi_id (
          *,
          profiles (
            id,
            name,
            nickname,
            profile_image
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch favorites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: favorites || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
