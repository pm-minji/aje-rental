import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  badgeColors,
  badgeSizes,
  statusToBadgeVariant,
  statusLabels,
  type BadgeVariant,
  type BadgeSize
} from '@/styles/tokens'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeColors[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Status badges for requests
export function StatusBadge({ status }: { status: string }) {
  const variant = statusToBadgeVariant[status] || 'default'
  const label = statusLabels[status] || status

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}