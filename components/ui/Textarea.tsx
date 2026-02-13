/**
 * Textarea Component
 * 
 * Reusable textarea component with proper styling and accessibility.
 * Supports all standard textarea props and can display errors.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   placeholder="Enter description"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   rows={4}
 *   error="This field is required"
 * />
 * ```
 */

import { TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error message to display below textarea
   */
  error?: string
  
  /**
   * Label text (optional, for accessibility)
   */
  label?: string
  
  /**
   * Helper text to display below textarea
   */
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      label,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id || `textarea-${generatedId}`
    
    const baseStyles = 'block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder:text-gray-400 resize-y'
    
    const errorStyles = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(baseStyles, errorStyles, className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />
        
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="mt-1 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea

