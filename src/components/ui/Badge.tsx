import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * @constant badgeVariants
 * @description cva를 사용하여 배지의 다양한 스타일 변형(variant)을 정의합니다.
 */
const badgeVariants = cva(
  // 공통 기본 스타일: 모든 배지에 적용됩니다.
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      /**
       * @property variant
       * @description 배지의 시각적 스타일을 결정합니다. (예: primary, secondary, destructive 등)
       */
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
        destructive:
          'border-transparent bg-red-500 text-destructive-foreground hover:bg-red-500/80 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        info:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      },
    },
    // 기본값 설정
    defaultVariants: {
      variant: 'default',
    },
  }
)

/**
 * @interface BadgeProps
 * @description Badge 컴포넌트가 받는 props의 타입을 정의합니다.
 * React의 기본 HTML 속성을 상속받고, cva로 정의한 variant를 추가로 받습니다.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * @component Badge
 * @description 텍스트에 간단한 하이라이트를 주기 위한 배지 컴포넌트입니다.
 * @param {BadgeProps} props - className, variant 등 배지를 커스터마이징하는 props.
 * @returns {JSX.Element} - 스타일이 적용된 배지 컴포넌트.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

/**
 * @type StatusVariant
 * @description 요청 상태(status)에 따라 결정될 배지의 variant와 표시될 텍스트(label)의 타입을 정의합니다.
 */
type StatusVariant = 'warning' | 'info' | 'destructive' | 'success' | 'secondary' | 'default';

/**
 * @component StatusBadge
 * @description 서비스 요청 상태(예: 'PENDING', 'COMPLETED')에 따라 적절한 스타일과 텍스트를 보여주는 특화된 배지 컴포넌트입니다.
 * @param {{ status: string }} props - 'PENDING', 'CONFIRMED' 등 API로부터 받은 상태 문자열.
 * @returns {JSX.Element} - 상태에 맞는 스타일과 텍스트가 적용된 Badge 컴포넌트.
 */
function StatusBadge({ status }: { status: string }) {
  // 상태 문자열을 배지 스타일과 한글 텍스트로 매핑하는 설정 객체입니다.
  const statusConfig: Record<string, { variant: StatusVariant; label: string }> = {
    PENDING: { variant: 'warning', label: '대기중' },
    CONFIRMED: { variant: 'info', label: '확정' },
    REJECTED: { variant: 'destructive', label: '거절' },
    COMPLETED: { variant: 'success', label: '완료' },
    CANCELLED: { variant: 'secondary', label: '취소' },
    EXPIRED: { variant: 'secondary', label: '만료' },
  }

  // 주어진 status에 해당하는 설정을 찾습니다. 만약 정의되지 않은 status가 들어올 경우, 기본값을 사용합니다.
  // 이는 예기치 않은 API 응답에 대한 방어 코드 역할을 합니다.
  const config = statusConfig[status] || {
    variant: 'default' as const,
    label: status, // 정의되지 않은 상태는 그대로 표시
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants }