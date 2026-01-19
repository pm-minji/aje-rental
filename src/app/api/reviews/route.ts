import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - 리뷰 목록 조회 (내가 작성한 리뷰 또는 내가 받은 리뷰)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isReceived = searchParams.get('received') === 'true'
    const isWritten = searchParams.get('written') === 'true'

    const supabase = await createServerSupabase()

    if (isReceived) {
      // 아저씨가 받은 리뷰 조회
      // 먼저 아저씨 프로필 확인
      const { data: ajussiProfile } = await supabase
        .from('ajussi_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (!ajussiProfile) {
        return NextResponse.json({ success: true, data: [] })
      }

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            name,
            nickname,
            profile_image
          ),
          request:requests!request_id (
            ajussi_id,
            client_id,
            date,
            duration,
            location
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch reviews' },
          { status: 500 }
        )
      }

      // 내가 받은 리뷰만 필터링
      const receivedReviews = reviews?.filter(
        (r) => r.request?.ajussi_id === user.id
      ) || []

      return NextResponse.json({ success: true, data: receivedReviews })
    }

    if (isWritten) {
      // 내가 작성한 리뷰 조회
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          request:requests!request_id (
            ajussi_id,
            client_id,
            ajussi_profiles:ajussi_profiles!inner (
              title,
              user_id,
              profiles:profiles!user_id (
                name,
                nickname,
                profile_image
              )
            )
          )
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch reviews' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data: reviews || [] })
    }

    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { requestId, rating, comment } = body

    if (!requestId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Request ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Check if the request exists and is completed
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'COMPLETED')
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { success: false, error: 'Request not found or not completed' },
        { status: 404 }
      )
    }

    // Check if user is the client (only clients can review)
    if (requestData.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only clients can write reviews' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('request_id', requestId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review already exists for this request' },
        { status: 400 }
      )
    }

    // Create the review
    const { data: newReview, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        request_id: requestId,
        reviewer_id: user.id,
        rating,
        comment: comment || null,
      })
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
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { success: false, error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newReview,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

