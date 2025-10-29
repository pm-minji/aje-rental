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
        router.push('/auth/login')
        return
      }

      if (requireAjussi && !isAjussi) {
        router.push('/') // Redirect to home if not ajussi
        return
      }
    }
  }, [isAuthenticated, isAjussi, loading, requireAjussi, router])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (requireAjussi && !isAjussi) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}