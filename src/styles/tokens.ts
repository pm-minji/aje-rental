/**
 * 디자인 토큰 - 프로젝트 전반에서 사용되는 색상, 간격, 크기 등의 디자인 값을 중앙 관리
 * 
 * @example
 * import { colors, spacing, sizes } from '@/styles/tokens'
 * 
 * // 뱃지 색상 사용
 * <span className={colors.badge.success}>Success</span>
 * 
 * // 상태 색상 사용
 * <div className={`${colors.status.pending.bg} ${colors.status.pending.text}`}>
 *   대기중
 * </div>
 */

// ============================================================
// 색상 토큰
// ============================================================

/**
 * 상태별 색상 토큰
 * - 의뢰 상태, 신청 상태 등에 사용
 */
export const statusColors = {
    PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: '대기중',
    },
    CONFIRMED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: '확정',
    },
    COMPLETED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '완료',
    },
    REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: '거절',
    },
    CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        label: '취소',
    },
    EXPIRED: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        label: '만료',
    },
    // 신청 상태
    APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '승인',
    },
} as const

export type RequestStatus = keyof typeof statusColors

/**
 * 뱃지 Variant 색상 토큰
 */
export const badgeColors = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
} as const

export type BadgeVariant = keyof typeof badgeColors

/**
 * 버튼 Variant 색상 토큰
 */
export const buttonColors = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const

export type ButtonVariant = keyof typeof buttonColors

// ============================================================
// 크기 토큰
// ============================================================

/**
 * 뱃지 크기 토큰
 */
export const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
} as const

export type BadgeSize = keyof typeof badgeSizes

/**
 * 버튼 크기 토큰
 */
export const buttonSizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
} as const

export type ButtonSize = keyof typeof buttonSizes

/**
 * 모달 크기 토큰
 */
export const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
} as const

export type ModalSize = keyof typeof modalSizes

/**
 * 아바타 크기 토큰
 */
export const avatarSizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
} as const

export type AvatarSize = keyof typeof avatarSizes

// ============================================================
// 간격 토큰
// ============================================================

export const spacing = {
    /** 모달 내부 패딩 */
    modalPadding: 'p-6',
    /** 카드 내부 패딩 */
    cardPadding: 'p-4',
    /** 섹션 간 간격 */
    sectionGap: 'space-y-6',
    /** 요소 간 간격 */
    elementGap: 'space-y-4',
    /** 인라인 간격 */
    inlineGap: 'space-x-3',
} as const

// ============================================================
// 상태 → 뱃지 Variant 매핑
// ============================================================

/**
 * Request/Application 상태를 Badge variant로 변환
 */
export const statusToBadgeVariant: Record<string, BadgeVariant> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    COMPLETED: 'success',
    REJECTED: 'error',
    CANCELLED: 'secondary',
    EXPIRED: 'secondary',
    APPROVED: 'success',
}

/**
 * 상태 라벨 매핑
 */
export const statusLabels: Record<string, string> = {
    PENDING: '대기중',
    CONFIRMED: '확정',
    COMPLETED: '완료',
    REJECTED: '거절',
    CANCELLED: '취소',
    EXPIRED: '만료',
    APPROVED: '승인',
}
