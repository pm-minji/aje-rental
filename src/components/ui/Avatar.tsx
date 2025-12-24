import * as React from 'react'
import { User } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * @constant avatarVariants
 * @description cva를 사용하여 아바타 컨테이너의 크기 변형을 정의합니다.
 */
const avatarVariants = cva(
  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

/**
 * @constant fallbackTextVariants
 * @description cva를 사용하여 fallback 텍스트(이니셜)의 크기 변형을 정의합니다.
 */
const fallbackTextVariants = cva('font-semibold text-slate-500 dark:text-slate-400', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * @constant fallbackIconVariants
 * @description cva를 사용하여 fallback 아이콘의 크기 변형을 정의합니다.
 */
const fallbackIconVariants = cva('text-slate-400 dark:text-slate-500', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * @interface AvatarProps
 * @description Avatar 컴포넌트가 받는 props의 타입을 정의합니다.
 * @property {string} [src] - 표시할 이미지의 URL.
 * @property {string} [alt] - 이미지의 대체 텍스트.
 * @property {string} [fallback] - 이미지가 없을 때 표시할 텍스트 (보통 이름의 이니셜).
 */
export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null
  alt?: string
  fallback?: string
}

/**
 * @component Avatar
 * @description 사용자 프로필 이미지를 표시하는 아바타 컴포넌트입니다.
 * 이미지 로딩 중에는 스켈레톤 UI를, 로딩 실패 시에는 fallback(이니셜 또는 기본 아이콘)을 보여줍니다.
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, className, size, ...props }, ref) => {
    // 이미지의 상태를 'loading', 'loaded', 'error'로 관리하여 UX를 향상시킵니다.
    const [imageStatus, setImageStatus] = React.useState<'loading' | 'loaded' | 'error'>(
      src ? 'loading' : 'error'
    )

    // src prop이 변경될 때마다 이미지 상태를 다시 초기화합니다.
    React.useEffect(() => {
      setImageStatus(src ? 'loading' : 'error')
    }, [src])

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {/* 상태 1: 로딩 중일 때 스켈레톤 UI를 보여줍니다. */}
        {imageStatus === 'loading' && (
          <div className="h-full w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        )}

        {/* 실제 이미지를 렌더링하는 부분. 로딩이 성공해야만 화면에 표시됩니다. */}
        <img
          src={src ?? ''}
          alt={alt ?? ''}
          className={cn(
            'h-full w-full rounded-full object-cover',
            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
          // 이미지 로딩이 성공하면 상태를 'loaded'로 변경합니다.
          onLoad={() => setImageStatus('loaded')}
          // 이미지 로딩이 실패하면 상태를 'error'로 변경합니다.
          onError={() => setImageStatus('error')}
        />

        {/* 상태 2: 로딩 실패(또는 src 없음) 시 Fallback UI를 보여줍니다. */}
        {imageStatus === 'error' && (
          <div
            className={cn(
              'absolute flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'
            )}
          >
            {fallback ? (
              // fallback 텍스트가 있으면 첫 글자를 대문자로 표시합니다.
              <span className={cn(fallbackTextVariants({ size }))}>
                {fallback[0]?.toUpperCase()}
              </span>
            ) : (
              // fallback 텍스트가 없으면 기본 사용자 아이콘을 표시합니다.
              <User className={cn(fallbackIconVariants({ size }))} />
            )}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }