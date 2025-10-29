import { ReactNode, FormHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

interface FormGroupProps {
  children: ReactNode
  className?: string
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  )
}

interface FormActionsProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div className={cn('flex space-x-3', alignClasses[align], className)}>
      {children}
    </div>
  )
}