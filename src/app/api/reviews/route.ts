import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'

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

    const supabase = createServerSupabase()

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