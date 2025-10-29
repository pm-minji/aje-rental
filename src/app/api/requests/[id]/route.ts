import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    // Get the request to check permissions
    const { data: existingRequest, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check permissions based on status change
    let canUpdate = false
    
    if (status === 'CONFIRMED' || status === 'REJECTED') {
      // Only ajussi can confirm or reject
      canUpdate = existingRequest.ajussi_id === user.id
    } else if (status === 'CANCELLED') {
      // Only client can cancel
      canUpdate = existingRequest.client_id === user.id
    } else if (status === 'COMPLETED') {
      // Both client and ajussi can mark as completed
      canUpdate = existingRequest.client_id === user.id || existingRequest.ajussi_id === user.id
    }

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this request' },
        { status: 403 }
      )
    }

    // Check if status transition is valid
    const currentStatus = existingRequest.status
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'REJECTED': [],
      'COMPLETED': [],
      'CANCELLED': [],
    }

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      )
    }

    // Update the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        client:profiles!client_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi:profiles!ajussi_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi_profiles!ajussi_id (
          title,
          hourly_rate
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating request:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // TODO: Send notification to the other party (implement later with Supabase Realtime)

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = createServerSupabase()

    const { data: requestData, error } = await supabase
      .from('requests')
      .select(`
        *,
        client:profiles!client_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi:profiles!ajussi_id (
          id,
          name,
          nickname,
          profile_image
        ),
        ajussi_profiles!ajussi_id (
          title,
          hourly_rate
        )
      `)
      .eq('id', id)
      .or(`client_id.eq.${user.id},ajussi_id.eq.${user.id}`)
      .single()

    if (error || !requestData) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requestData,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}