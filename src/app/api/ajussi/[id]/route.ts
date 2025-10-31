import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = await createServerSupabase()

    // Get ajussi profile with user info
    const { data: ajussi, error: ajussiError } = await supabase
      .from('ajussi_profiles')
      .select(`
        *,
        profiles (
          id,
          name,
          nickname,
          profile_image,
          introduction
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (ajussiError || !ajussi) {
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
