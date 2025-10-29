import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const minRate = searchParams.get('minRate')
    const maxRate = searchParams.get('maxRate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    const supabase = createServerSupabase()
    
    let query = supabase
      .from('ajussi_profiles')
      .select(`
        *,
        profiles (
          id,
          name,
          nickname,
          profile_image
        )
      `)
      .eq('is_active', true)

    // Location filter
    if (location) {
      query = query.contains('available_areas', [location])
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // Rate filters
    if (minRate) {
      query = query.gte('hourly_rate', parseInt(minRate))
    }
    if (maxRate) {
      query = query.lte('hourly_rate', parseInt(maxRate))
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Order by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching ajussi profiles:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ajussi profiles' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('ajussi_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
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