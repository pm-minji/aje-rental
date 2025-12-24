import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * @constant buttonVariants
 * @description cva(class-variance-authority)를 사용하여 버튼의 다양한 스타일 변형(variant)과 크기(size)를 정의합니다.
 * 이를 통해 일관된 디자인 시스템을 유지하면서도 유연하게 버튼 스타일을 적용할 수 있습니다.
 */
const buttonVariants = cva(
  // 공통 기본 스타일: 모든 버튼에 적용됩니다.
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
  {
    variants: {
      /**
       * @property variant
       * @description 버튼의 시각적 스타일을 결정합니다. (예: primary, secondary, outline 등)
       */
      variant: {
        default: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transform hover:-translate-y-0.5',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-600/90 dark:bg-red-700 dark:hover:bg-red-700/90',
        outline:
          'border border-slate-300 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-50',
        secondary:
          'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200/80 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-700/80',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-50',
        link: 'text-primary underline-offset-4 hover:underline dark:text-blue-400',
      },
      /**
       * @property size
       * @description 버튼의 크기를 결정합니다. (예: small, default, large)
       */
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-8 text-base', // 더 크고 명확한 클릭 영역 제공
        icon: 'h-10 w-10',
      },
    },
    // 기본값 설정: variant나 size가 명시되지 않았을 때 적용될 기본 스타일입니다.
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * @interface ButtonProps
 * @description Button 컴포넌트가 받는 props의 타입을 정의합니다.
 * React의 기본 버튼 속성을 상속받고, cva로 정의한 variant와 size를 추가로 받습니다.
 * @property {boolean} [asChild=false] - true로 설정하면, Button은 자체 <button> 태그 대신 자식 컴포넌트의 props를 상속받아 렌더링합니다. (e.g., <Button asChild><Link href="/">Home</Link></Button>)
 * @property {boolean} [loading=false] - true로 설정하면, 버튼 내부에 로딩 스피너를 표시하고 버튼을 비활성화합니다.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

/**
 * @component Button
 * @description 프로젝트 전반에서 사용될 재사용 가능한 버튼 컴포넌트입니다.
 * @param {ButtonProps} props - className, variant, size, asChild 등 버튼을 커스터마이징하는 props.
 * @param {React.Ref<HTMLButtonElement>} ref - 외부에서 버튼 DOM 요소에 접근하기 위한 ref.
 * @returns {JSX.Element} - 스타일이 적용된 버튼 컴포넌트.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    // asChild prop이 true이면 Slot 컴포넌트를, 아니면 일반 'button' 태그를 사용합니다.
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        // cn 유틸리티 함수를 사용하여 기본 스타일, variant/size 스타일, 그리고 외부에서 주입된 className을 병합합니다.
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* loading 상태일 때 스피너를 표시합니다. */}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-current mr-2" />
        )}
        {/* asChild가 아닐 때만 children을 직접 렌더링합니다 (Slot이 자식 관리를 함). */}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button' // React 개발자 도구에서 컴포넌트 이름을 쉽게 식별하기 위함입니다.

export { Button, buttonVariants }