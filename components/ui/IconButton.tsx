/**
 * Icon Button Component
 * 
 * Icon-only button for toolbars and compact UIs.
 * Supports active states, tooltips, and loading animations.
 * 
 * @example
 * ```tsx
 * <IconButton
 *   icon={<IconHighlight />}
 *   active={isActive}
 *   onClick={handleClick}
 *   aria-label="Highlight text"
 * />
 * ```
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconSpinner } from './icons'

export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonVariant = 'default' | 'ghost' | 'outline'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon element to display
   */
  icon: ReactNode
  
  /**
   * Whether button is in active/selected state
   */
  active?: boolean
  
  /**
   * Whether button is in loading state
   */
  loading?: boolean
  
  /**
   * Button size
   */
  size?: IconButtonSize
  
  /**
   * Button variant
   */
  variant?: IconButtonVariant
  
  /**
   * Tooltip text (uses title attribute)
   */
  tooltip?: string
}

const SIZE_STYLES: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

const VARIANT_STYLES: Record<IconButtonVariant, { default: string; active: string }> = {
  default: {
    default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    active: 'bg-indigo-600 text-white border-indigo-600',
  },
  ghost: {
    default: 'bg-transparent text-gray-700 hover:bg-gray-100',
    active: 'bg-indigo-100 text-indigo-700',
  },
  outline: {
    default: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
    active: 'bg-indigo-50 text-indigo-700 border-indigo-500',
  },
}

export default function IconButton({
  icon,
  active = false,
  loading = false,
  size = 'md',
  variant = 'default',
  tooltip,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  const variantStyle = VARIANT_STYLES[variant]
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        SIZE_STYLES[size],
        active ? variantStyle.active : variantStyle.default,
        className
      )}
      disabled={disabled || loading}
      title={tooltip}
      aria-label={tooltip || props['aria-label']}
      {...props}
    >
      {loading ? <IconSpinner className="h-4 w-4" /> : icon}
    </button>
  )
}
