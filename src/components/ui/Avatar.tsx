import { useState } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

export function Avatar({ 
  src, 
  alt = '', 
  size = 'md', 
  className, 
  fallback 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {fallback ? (
        <span className={cn('font-medium text-gray-600', textSizes[size])}>
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className={cn('text-gray-400', iconSizes[size])} />
      )}
    </div>
  )
}