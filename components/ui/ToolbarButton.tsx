/**
 * Toolbar Button Component
 * 
 * Specialized button for editor toolbars with toggle states.
 * Supports icon+text layout and active state styling.
 * 
 * @example
 * ```tsx
 * <ToolbarButton
 *   active={activeTool === 'highlight'}
 *   onClick={() => setTool('highlight')}
 *   icon={<IconHighlight />}
 * >
 *   Highlight
 * </ToolbarButton>
 * ```
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether button is in active/selected state
   */
  active?: boolean
  
  /**
   * Icon element to display before text
   */
  icon?: ReactNode
  
  /**
   * Active color variant
   */
  activeColor?: 'indigo' | 'yellow' | 'blue' | 'green' | 'red'
}

const ACTIVE_COLOR_STYLES: Record<string, string> = {
  indigo: 'bg-indigo-600 text-white',
  yellow: 'bg-yellow-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
}

export default function ToolbarButton({
  active = false,
  icon,
  activeColor = 'indigo',
  disabled,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active
          ? ACTIVE_COLOR_STYLES[activeColor]
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
