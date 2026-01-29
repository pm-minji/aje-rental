import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getAjussiProfiles } from './service'

// Allow caching for 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    const supabase = await createServerSupabase()

    const { data, error, count } = await getAjussiProfiles(supabase, {
      location,
      search,
      page,
      limit
    })

    if (error) {
      console.error('Error fetching ajussi profiles:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ajussi profiles' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
