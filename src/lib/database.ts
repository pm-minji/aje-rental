import { createServerSupabase, createClientSupabase } from './supabase'
import { Database, Profile, AjussiProfile, Request, Review, Favorite } from '@/types/database'

type Tables = Database['public']['Tables']

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const supabase = createClientSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Ajussi profile operations
export const getAjussiProfiles = async (filters?: {
  location?: string
  tags?: string[]
  minRate?: number
  maxRate?: number
  limit?: number
  offset?: number
}) => {
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

  if (filters?.location) {
    query = query.contains('available_areas', [filters.location])
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters?.minRate) {
    query = query.gte('hourly_rate', filters.minRate)
  }

  if (filters?.maxRate) {
    query = query.lte('hourly_rate', filters.maxRate)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  return { data, error }
}

export const getAjussiProfile = async (userId: string) => {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
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
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export const getAjussiProfileById = async (profileId: string) => {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
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
    .eq('id', profileId)
    .single()

  return { data, error }
}

// Request operations
export const createRequest = async (requestData: Tables['requests']['Insert']) => {
  const supabase = createClientSupabase()
  const { data, error } = await supabase
    .from('requests')
    .insert(requestData)
    .select()
    .single()

  return { data, error }
}

export const getUserRequests = async (userId: string, type: 'sent' | 'received') => {
  const supabase = await createServerSupabase()
  const column = type === 'sent' ? 'client_id' : 'ajussi_id'
  
  const { data, error } = await supabase
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
    .eq(column, userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const updateRequestStatus = async (
  requestId: string, 
  status: Tables['requests']['Row']['status'],
  userId: string
) => {
  const supabase = createClientSupabase()
  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', requestId)
    .or(`client_id.eq.${userId},ajussi_id.eq.${userId}`)
    .select()
    .single()

  return { data, error }
}

// Review operations
export const getAjussiReviews = async (ajussiId: string) => {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
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
    .eq('requests.ajussi_id', ajussiId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createReview = async (reviewData: Tables['reviews']['Insert']) => {
  const supabase = createClientSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single()

  return { data, error }
}

// Favorite operations
export const getUserFavorites = async (userId: string) => {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      ajussi_profiles!ajussi_id (
        *,
        profiles (
          id,
          name,
          nickname,
          profile_image
        )
      )
    `)
    .eq('user_id', userId)

  return { data, error }
}

export const toggleFavorite = async (userId: string, ajussiId: string) => {
  const supabase = createClientSupabase()
  
  // Check if favorite exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('ajussi_id', ajussiId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('ajussi_id', ajussiId)
    
    return { data: null, error, action: 'removed' }
  } else {
    // Add favorite
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, ajussi_id: ajussiId })
      .select()
      .single()
    
    return { data, error, action: 'added' }
  }
}