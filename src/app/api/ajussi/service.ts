import { SupabaseClient } from '@supabase/supabase-js'

export async function getAjussiProfiles(
  supabase: SupabaseClient,
  params: {
    location?: string | null
    search?: string | null
    page?: number
    limit?: number
  }
) {
  const { location, search, page = 1, limit = 12 } = params
  const offset = (page - 1) * limit

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
    `, { count: 'exact' })
    .eq('is_active', true)

  if (location) {
    query = query.contains('available_areas', [location])
  }

  if (search) {
    const searchTerm = search.replace(/^#/, '').trim()
    // Using ILIKE for title and description for case-insensitive partial match.
    // For tags, using contains (cs) for exact match in array.
    // Note: PostgREST syntax for OR is strict. We need to be careful with the format.
    // We filter out commas from search term to avoid breaking the OR syntax
    const safeSearchTerm = searchTerm.replace(/,/g, '')

    if (safeSearchTerm) {
      query = query.or(`title.ilike.%${safeSearchTerm}%,description.ilike.%${safeSearchTerm}%,tags.cs.{${safeSearchTerm}}`)
    }
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  return { data, error, count }
}
