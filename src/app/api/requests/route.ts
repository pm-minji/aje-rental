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
    const { ajussiId, date, time, duration, location, description } = body

    // Validate required fields
    if (!ajussiId || !date || !time || !duration || !location || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Combine date and time
    const requestDateTime = new Date(`${date}T${time}:00`)
    
    // Check if the date is in the future
    if (requestDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Request date must be in the future' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Check if ajussi exists and is active
    const { data: ajussi, error: ajussiError } = await supabase
      .from('ajussi_profiles')
      .select('user_id, is_active')
      .eq('user_id', ajussiId)
      .single()

    if (ajussiError || !ajussi || !ajussi.is_active) {
      return NextResponse.json(
        { success: false, error: 'Ajussi not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user is trying to request their own service
    if (ajussi.user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot request your own service' },
        { status: 400 }
      )
    }

    // Create the request
    const { data: newRequest, error: requestError } = await supabase
      .from('requests')
      .insert({
        client_id: user.id,
        ajussi_id: ajussiId,
        date: requestDateTime.toISOString(),
        duration: parseInt(duration),
        location,
        description,
        status: 'PENDING',
      })
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
        )
      `)
      .single()

    if (requestError) {
      console.error('Error creating request:', requestError)
      return NextResponse.json(
        { success: false, error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // TODO: Send notification to ajussi (implement later with Supabase Realtime)

    return NextResponse.json({
      success: true,
      data: newRequest,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get user from session directly
    const supabase = await createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('GET /api/requests - User:', user?.id)
    console.log('GET /api/requests - Error:', userError)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
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
        )
      `)

    // Filter by type (sent or received)
    if (type === 'sent') {
      query = query.eq('client_id', user.id)
    } else if (type === 'received') {
      query = query.eq('ajussi_id', user.id)
    } else {
      // Both sent and received
      query = query.or(`client_id.eq.${user.id},ajussi_id.eq.${user.id}`)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: requests, error } = await query

    if (error) {
      console.error('Error fetching requests:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch requests' },
        { status: 500 }
      )
    }

    // Get ajussi_profiles for each request
    if (requests && requests.length > 0) {
      const ajussiIds = requests.map(req => req.ajussi_id)
      const { data: ajussiProfiles } = await supabase
        .from('ajussi_profiles')
        .select('user_id, id, title, hourly_rate, open_chat_url')
        .in('user_id', ajussiIds)

      // Add ajussi_profiles to each request
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        ajussi_profiles: ajussiProfiles?.find(profile => profile.user_id === request.ajussi_id) || null
      }))

      return NextResponse.json({
        success: true,
        data: requestsWithProfiles,
      })
    }

    return NextResponse.json({
      success: true,
      data: requests || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
