import { NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase'
import { deleteUserData } from '@/lib/account-deletion'

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

    await deleteUserData(supabase, user.id)

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
