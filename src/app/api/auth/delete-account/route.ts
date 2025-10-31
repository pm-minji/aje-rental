import { NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabase()

    // Delete user data in order (foreign key constraints)
    console.log('Deleting user data for:', user.id)

    // Delete reviews
    await supabase.from('reviews').delete().eq('reviewer_id', user.id)
    await supabase.from('reviews').delete().eq('client_id', user.id)

    // Delete favorites
    await supabase.from('favorites').delete().eq('user_id', user.id)

    // Delete requests
    await supabase.from('requests').delete().eq('client_id', user.id)
    await supabase.from('requests').delete().eq('ajussi_id', user.id)

    // Delete ajussi profile
    await supabase.from('ajussi_profiles').delete().eq('user_id', user.id)

    // Delete user profile
    await supabase.from('profiles').delete().eq('id', user.id)

    // Note: Client will handle sign out

    console.log('Account deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error deleting account:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
