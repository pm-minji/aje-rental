import { useRouter } from 'next/navigation'

export const useAuthRedirect = () => {
  const router = useRouter()

  const requireAuth = (callback?: () => void) => {
    const currentPath = window.location.pathname + window.location.search
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  return { requireAuth }
}

export const redirectToLogin = (currentPath?: string) => {
  const path = currentPath || window.location.pathname + window.location.search
  window.location.href = `/auth/login?redirect=${encodeURIComponent(path)}`
}