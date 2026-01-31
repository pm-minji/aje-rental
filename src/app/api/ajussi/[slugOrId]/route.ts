import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// UUID 형식 체크
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slugOrId: string } }
) {
  try {
    const { slugOrId } = params
    const supabase = await createServerSupabase()

    let ajussi = null

    // 1. slug로 먼저 조회
    const { data: bySlug } = await supabase
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
      .eq('slug', slugOrId)
      .eq('is_active', true)
      .single()

    if (bySlug) {
      ajussi = bySlug
    } else if (isUUID(slugOrId)) {
      // 2. UUID로 fallback 조회
      const { data: byId } = await supabase
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
        .eq('id', slugOrId)
        .eq('is_active', true)
        .single()

      ajussi = byId
    }

    if (!ajussi) {
      return NextResponse.json(
        { success: false, error: 'Ajussi not found' },
        { status: 404 }
      )
    }

    // Get reviews for this ajussi
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id (
          name,
          nickname,
          profile_image
        ),
        request:requests!request_id (
          date,
          duration,
          location
        )
      `)
      .eq('requests.ajussi_id', ajussi.user_id)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    // Calculate average rating
    const validReviews = reviews || []
    const averageRating = validReviews.length > 0
      ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ajussi,
        reviews: validReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: validReviews.length,
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
