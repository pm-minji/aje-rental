import { SupabaseClient } from '@supabase/supabase-js'

export async function deleteUserData(supabase: SupabaseClient, userId: string) {
  // Delete user data in order (foreign key constraints)
  console.log('Deleting user data for:', userId)

  // Delete reviews and favorites (independent leaves)
  await Promise.all([
    supabase.from('reviews').delete().eq('reviewer_id', userId),
    supabase.from('reviews').delete().eq('client_id', userId),
    supabase.from('favorites').delete().eq('user_id', userId),
  ])

  // Delete requests
  await Promise.all([
    supabase.from('requests').delete().eq('client_id', userId),
    supabase.from('requests').delete().eq('ajussi_id', userId),
  ])

  // Delete ajussi profile
  await supabase.from('ajussi_profiles').delete().eq('user_id', userId)

  // Delete user profile
  await supabase.from('profiles').delete().eq('id', userId)
}
