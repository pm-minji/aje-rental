'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Loading } from '@/components/ui/Loading'

export default function AuthLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="로딩 중..." />
      </div>
    )
  }

  return <>{children}</>
}