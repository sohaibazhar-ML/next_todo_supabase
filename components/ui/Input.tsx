/**
 * Input Component
 * 
 * Reusable text input component with proper styling and accessibility.
 * Supports all standard input props and can display errors.
 * 
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="Enter text"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   error="This field is required"
 * />
 * ```
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error message to display below input
   */
  error?: string
  
  /**
   * Label text (optional, for accessibility)
   */
  label?: string
  
  /**
   * Helper text to display below input
   */
  helperText?: string
  
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode
  
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    const baseStyles = 'block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder:text-gray-400'
    
    const errorStyles = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              errorStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

