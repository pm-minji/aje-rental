import { forwardRef, InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={checkboxId}
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2',
                error && 'border-red-500',
                className
              )}
              ref={ref}
              {...props}
            />
            {props.checked && (
              <Check className="absolute h-3 w-3 text-white pointer-events-none left-0.5 top-0.5" />
            )}
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm text-gray-700 cursor-pointer flex-1"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 ml-7">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 ml-7">{helperText}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }