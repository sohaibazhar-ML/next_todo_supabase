/**
 * Loading Overlay Component
 * 
 * Reusable loading overlay that can be wrapped around any content.
 * Shows a spinner and disables pointer events while loading.
 * 
 * @example
 * ```tsx
 * <LoadingOverlay isLoading={isLoading} message="Loading data...">
 *   <YourContent />
 * </LoadingOverlay>
 * ```
 */

'use client'

import { IconSpinner } from './icons'
import { THEME } from '@/constants/theme'

export interface LoadingOverlayProps {
  /**
   * Whether to show the loading overlay
   */
  isLoading: boolean
  
  /**
   * Content to display (will be disabled when loading)
   */
  children: React.ReactNode
  
  /**
   * Optional loading message to display
   */
  message?: string
  
  /**
   * Optional className for the overlay container
   */
  className?: string
}

/**
 * Loading overlay component that disables content and shows a spinner
 */
export function LoadingOverlay({
  isLoading,
  children,
  message,
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className={`absolute inset-0 bg-white bg-opacity-75 ${THEME.Z_INDEX.MODAL} flex items-center justify-center rounded-lg`}>
          <div className="text-center">
            <IconSpinner className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            {message && (
              <p className="text-gray-600 font-medium">{message}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Content (disabled when loading) */}
      <div className={isLoading ? 'pointer-events-none opacity-60' : ''}>
        {children}
      </div>
    </div>
  )
}
