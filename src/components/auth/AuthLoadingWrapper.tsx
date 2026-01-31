'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { usePathname } from 'next/navigation'
import { Loading } from '@/components/ui/Loading'

// Protected routes that require auth loading to complete
const PROTECTED_ROUTE_PREFIXES = ['/mypage', '/admin', '/auth/setup-profile']

export default function AuthLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()
  const pathname = usePathname()

  // Only show loading spinner for protected routes
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))

  // For public routes (home, ajussi list, etc), render immediately without waiting for auth
  if (!isProtectedRoute) {
    return <>{children}</>
  }

  // For protected routes, wait for auth to complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="로딩 중..." />
      </div>
    )
  }

  return <>{children}</>
}