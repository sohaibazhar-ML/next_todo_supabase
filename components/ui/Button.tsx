/**
 * Button Component
 * 
 * Reusable button component with variants and sizes.
 * Supports all standard button props and accessibility features.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" loading={isLoading} onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconSpinner } from './icons'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  
  /**
   * Button size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  
  /**
   * Whether button is in loading state
   */
  loading?: boolean
  
  /**
   * Whether button should take full width
   */
  fullWidth?: boolean
  
  /**
   * Icon to display before text
   */
  icon?: ReactNode
  
  /**
   * Icon to display after text
   */
  iconRight?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconRight,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-indigo-500',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg focus:ring-green-500',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg focus:ring-yellow-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    }
    
    const sizes = {
      xs: 'px-2.5 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <IconSpinner className="-ml-1 mr-2 h-4 w-4" />}
        {!loading && icon && <span className="-ml-1 mr-2">{icon}</span>}
        {children}
        {!loading && iconRight && <span className="ml-2 -mr-1">{iconRight}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

