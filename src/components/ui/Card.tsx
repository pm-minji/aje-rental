import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * @interface CardProps
 * @description Card 컴포넌트가 받는 props의 타입 정의입니다.
 * @property {React.ReactNode} children - 카드 내부에 표시될 콘텐츠.
 * @property {boolean} [hoverEffect=false] - true일 경우, 마우스 호버 시 떠오르는 듯한 시각적 효과를 적용합니다.
 * @property {'div' | 'li' | 'article'} [as='div'] - 카드를 렌더링할 HTML 태그를 지정합니다.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  as?: 'div' | 'li' | 'article';
}

/**
 * @component Card
 * @description 콘텐츠를 감싸는 컨테이너 역할을 하는 기본 카드 컴포넌트입니다.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, as: Component = 'div', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'rounded-xl border border-slate-200 bg-white text-slate-950 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50',
        hoverEffect && 'transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

/**
 * @component CardHeader
 * @description 카드의 헤더(제목) 영역을 정의하는 컴포넌트입니다.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 border-b border-slate-200 dark:border-slate-800', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * @component CardTitle
 * @description CardHeader 내에서 제목 텍스트를 스타일링하는 컴포넌트입니다.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * @component CardDescription
 * @description CardHeader 내에서 설명 텍스트를 스타일링하는 컴포넌트입니다.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * @component CardContent
 * @description 카드의 메인 콘텐츠 영역을 정의하는 컴포넌트입니다.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * @component CardFooter
 * @description 카드의 푸터(하단) 영역을 정의하는 컴포넌트입니다. 주로 버튼이나 추가 정보를 배치합니다.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0 border-t border-slate-200 dark:border-slate-800', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }