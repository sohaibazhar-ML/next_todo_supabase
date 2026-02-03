/**
 * Select Component
 * 
 * Reusable select dropdown component with proper styling and accessibility.
 * Supports all standard select props and can display errors.
 * 
 * @example
 * ```tsx
 * <Select
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   error="This field is required"
 * />
 * ```
 */

import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Options for the select dropdown
   */
  options: SelectOption[]
  
  /**
   * Error message to display below select
   */
  error?: string
  
  /**
   * Label text (optional, for accessibility)
   */
  label?: string
  
  /**
   * Helper text to display below select
   */
  helperText?: string
  
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      error,
      label,
      helperText,
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || `select-${generatedId}`
    
    const baseStyles = 'block w-full px-3 py-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out text-gray-900'
    
    const errorStyles = error
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300'
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(baseStyles, errorStyles, className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="mt-1 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select

