import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client component client (for use in client components)
export const createClientSupabase = () => createClientComponentClient<Database>()

// Server component client (for use in server components)
export const createServerSupabase = () => createServerComponentClient<Database>({ cookies })

// Server-side client for admin operations
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Auth helpers
export const getUser = async () => {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}