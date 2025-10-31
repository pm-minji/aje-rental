'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAjussi?: boolean
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requireAjussi = false,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAjussi, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login')
        router.replace('/auth/login')
        return
      }

      if (requireAjussi && !isAjussi) {
        console.log('ProtectedRoute: User not ajussi, redirecting to home')
        router.replace('/') // Redirect to home if not ajussi
        return
      }
    }
  }, [isAuthenticated, isAjussi, loading, requireAjussi, router])

  // Show loading while auth state is being determined
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      )
    )
  }

  // If not authenticated, show nothing (redirect will happen in useEffect)
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Rendering null for unauthenticated user')
    return null
  }

  // If ajussi required but user is not ajussi, show nothing (redirect will happen in useEffect)
  if (requireAjussi && !isAjussi) {
    console.log('ProtectedRoute: Rendering null for non-ajussi user')
    return null
  }

  return <>{children}</>
}