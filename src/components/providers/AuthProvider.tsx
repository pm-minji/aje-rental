'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: any }>
  isAuthenticated: boolean
  isAjussi: boolean
  disableRedirect: () => void
  enableRedirect: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [profileCheckComplete, setProfileCheckComplete] = useState(false)

  const supabase = createClientSupabase()
  const router = useRouter()
  const pathname = usePathname()

  // Simple redirect disable mechanism
  const disableRedirect = () => {
    console.log('Redirect disabled - no-op for now')
  }

  const enableRedirect = () => {
    console.log('Redirect enabled - no-op for now')
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          console.log('Initial session found:', session.user.id)

          // Check if user still exists in database
          try {
            const profileData = await fetchProfile(session.user.id, true) // Allow redirect on initial load

            if (!mounted) return

            // If profile fetch fails (user deleted), sign out
            if (!profileData) {
              console.log('User profile not found, signing out...')
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setSession(null)
            } else {
              setUser(session.user)
              setProfile(profileData)
              setSession(session)
            }
          } catch (error) {
            console.error('Error fetching profile during initial session check:', error)
            // If there's an error fetching profile, sign out to be safe
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setSession(null)
          }
        }

        setLoading(false)
        setInitialLoadComplete(true)
        setProfileCheckComplete(true)
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
          setInitialLoadComplete(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)

        if (!mounted) return

        if (session?.user) {
          console.log('Processing user session...')

          // Only fetch profile and potentially redirect after initial load is complete
          // and if we're not on the setup page
          const shouldFetchProfile = initialLoadComplete && !pathname.includes('/auth/setup-profile')

          if (shouldFetchProfile) {
            const profileData = await fetchProfile(session.user.id, true) // Allow redirect

            if (!mounted) return

            setUser(session.user)
            setProfile(profileData)
            setSession(session)
          } else {
            // Just update user and session without fetching profile
            setUser(session.user)
            setSession(session)
          }
        } else {
          console.log('No user session, clearing state')
          setUser(null)
          setProfile(null)
          setSession(null)
        }

        if (mounted) {
          setLoading(false)
          setProfileCheckComplete(true)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, initialLoadComplete, pathname])

  const fetchProfile = async (userId: string, allowRedirect: boolean = false): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId, 'allowRedirect:', allowRedirect)

      const response = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Check if response is 401 (unauthorized)
      if (response.status === 401) {
        console.log('API returned 401, user session invalid, signing out...')
        await supabase.auth.signOut()
        return null
      }

      const result = await response.json()
      console.log('API create profile result:', result)

      if (result.success) {
        console.log('Profile created/fetched successfully via API')

        // Only redirect if explicitly allowed and conditions are met
        if (allowRedirect) {
          const needsProfileSetup = result.isNewUser || (!result.data.nickname)
          const isOnSetupPage = pathname.includes('/auth/setup-profile')

          if (needsProfileSetup && !isOnSetupPage) {
            console.log('New user detected, redirecting to profile setup')

            const redirectParam = new URLSearchParams(window.location.search).get('redirect')
            const setupUrl = redirectParam
              ? `/auth/setup-profile?redirect=${encodeURIComponent(redirectParam)}`
              : '/auth/setup-profile'

            // Use setTimeout to avoid race conditions
            setTimeout(() => {
              router.push(setupUrl)
            }, 100)
          }
        }

        return result.data
      } else {
        console.error('API error:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const signInWithGoogle = async (redirectTo?: string) => {
    const callbackUrl = redirectTo
      ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      // First delete user data from database
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        console.error('Error deleting account:', result.error)
        throw new Error(result.error || 'Failed to delete account')
      }

      console.log('User data deleted successfully, now signing out...')

      // Clear local state immediately BEFORE signOut to prevent race conditions
      setUser(null)
      setProfile(null)
      setSession(null)
      setLoading(false)
      setProfileCheckComplete(true)

      // Clear all Supabase auth cookies explicitly
      const clearSupabaseCookies = () => {
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const [name] = cookie.split('=')
          const trimmedName = name.trim()
          // Clear both with and without path
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
          // Also try with domain
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        })
      }

      // Clear all browser storage
      try {
        localStorage.clear()
        sessionStorage.clear()
        clearSupabaseCookies()

        // Clear IndexedDB (Supabase might use this)
        if ('indexedDB' in window) {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          }
        }
      } catch (storageError) {
        console.error('Error clearing storage:', storageError)
      }

      // Sign out from Supabase with scope: 'global' to invalidate all sessions
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (signOutError) {
        console.error('SignOut error (non-critical):', signOutError)
        // Continue even if signOut fails - user data is already deleted
      }

      // Clear cookies again after signOut (signOut might have set new ones)
      clearSupabaseCookies()

      console.log('Account deletion and sign out completed')

      // Force reload immediately to reset all state
      window.location.href = '/'
    } catch (error) {
      console.error('Error in deleteAccount:', error)
      throw error
    }
  }


  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }

    return { data, error }
  }

  const value = {
    user,
    profile,
    session,
    loading: loading || !profileCheckComplete,
    signInWithGoogle,
    signOut,
    deleteAccount,
    updateProfile,
    isAuthenticated: !!user,
    isAjussi: profile?.role === 'ajussi' || profile?.role === 'admin',
    disableRedirect,
    enableRedirect,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}