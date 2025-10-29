import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Status badges for requests
export function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { variant: 'warning' as const, label: '대기중' },
    CONFIRMED: { variant: 'info' as const, label: '확정' },
    REJECTED: { variant: 'error' as const, label: '거절' },
    COMPLETED: { variant: 'success' as const, label: '완료' },
    CANCELLED: { variant: 'secondary' as const, label: '취소' },
    EXPIRED: { variant: 'secondary' as const, label: '만료' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: 'default' as const,
    label: status,
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}