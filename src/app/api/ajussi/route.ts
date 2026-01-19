import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    const supabase = await createServerSupabase()

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

    // Order by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching ajussi profiles:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ajussi profiles' },
        { status: 500 }
      )
    }

    let filteredData = data || []

    // Search filter - search in title, description, and tags (client-side)
    if (search) {
      const searchTerm = search.replace(/^#/, '').trim().toLowerCase()

      filteredData = filteredData.filter(ajussi => {
        // Check title
        if (ajussi.title?.toLowerCase().includes(searchTerm)) return true
        // Check description
        if (ajussi.description?.toLowerCase().includes(searchTerm)) return true
        // Check tags array
        if (ajussi.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))) return true
        return false
      })
    }

    // Pagination (after filtering)
    const total = filteredData.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = filteredData.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedData,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
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
