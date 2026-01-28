/**
 * Close Button Component
 * 
 * Standardized X button for modals, messages, and dismissible components.
 * Includes accessibility features and consistent styling.
 * 
 * @example
 * ```tsx
 * <CloseButton onClick={onClose} />
 * ```
 */

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Custom aria-label (defaults to "Close")
   */
  label?: string
}

const SIZE_STYLES = {
  sm: 'h-6 w-6 text-sm',
  md: 'h-8 w-8 text-base',
  lg: 'h-10 w-10 text-lg',
}

export default function CloseButton({
  size = 'md',
  label = 'Close',
  className,
  ...props
}: CloseButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        SIZE_STYLES[size],
        className
      )}
      aria-label={label}
      {...props}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  )
}
