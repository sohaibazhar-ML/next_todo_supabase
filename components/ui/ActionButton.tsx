/**
 * Action Button Component
 * 
 * Specialized button for table/list actions with predefined color schemes.
 * Supports loading states and consistent styling across the application.
 * 
 * @example
 * ```tsx
 * <ActionButton variant="delete" loading={isDeleting} onClick={handleDelete}>
 *   Delete
 * </ActionButton>
 * ```
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconSpinner } from './icons'

export type ActionButtonVariant = 
  | 'edit' 
  | 'delete' 
  | 'remove'
  | 'view' 
  | 'upload' 
  | 'download'
  | 'feature' 
  | 'unfeature'
  | 'activate' 
  | 'deactivate'
  | 'convert'
  | 'primary'
  | 'secondary'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant (determines color scheme)
   */
  variant: ActionButtonVariant
  
  /**
   * Whether button is in loading state
   */
  loading?: boolean
  
  /**
   * Icon to display before text
   */
  icon?: ReactNode
}

const VARIANT_STYLES: Record<ActionButtonVariant, string> = {
  edit: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  delete: 'bg-red-100 text-red-800 hover:bg-red-200',
  remove: 'bg-red-100 text-red-800 hover:bg-red-200',
  view: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  upload: 'bg-green-100 text-green-800 hover:bg-green-200',
  download: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  feature: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  unfeature: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  activate: 'bg-green-100 text-green-800 hover:bg-green-200',
  deactivate: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  convert: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
}

export default function ActionButton({
  variant,
  loading = false,
  disabled,
  icon,
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-1.5',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500',
        VARIANT_STYLES[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <IconSpinner className="h-3 w-3" />}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
