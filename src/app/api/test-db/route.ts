import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    
    // Test basic connection
    console.log('Testing database connection...')
    
    // Try to get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Profiles query result:', { profiles, profilesError })
    
    // Try to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('version')
    
    console.log('Database version:', { tableInfo, tableError })
    
    return NextResponse.json({
      success: true,
      data: {
        profiles: profiles || [],
        profilesError,
        tableInfo,
        tableError
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
