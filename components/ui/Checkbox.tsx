/**
 * Checkbox Component
 * 
 * Reusable checkbox component with proper styling and accessibility.
 * Supports all standard checkbox props and can display errors.
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   checked={checked}
 *   onChange={(e) => setChecked(e.target.checked)}
 *   label="Accept terms and conditions"
 * />
 * ```
 */

import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text or React node to display next to checkbox
   */
  label?: string | React.ReactNode
  
  /**
   * Error message to display below checkbox
   */
  error?: string
  
  /**
   * Helper text to display below checkbox
   */
  helperText?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const checkboxId = id || `checkbox-${generatedId}`    
    const baseStyles = 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out'
    
    return (
      <div className="w-full">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(baseStyles, className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
            }
            {...props}
          />
          
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={`${checkboxId}-helper`}
            className="mt-1 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox

