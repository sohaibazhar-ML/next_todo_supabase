/**
 * Modal Component
 * 
 * Reusable modal/dialog component with backdrop, header, and content areas.
 * Supports keyboard navigation (ESC to close) and click-outside-to-close.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Modal Title"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */

'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { THEME } from '@/constants/theme'
import { cn } from '@/lib/utils/cn'

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean
  
  /**
   * Callback when modal should close
   */
  onClose: () => void
  
  /**
   * Modal title (displayed in header)
   */
  title?: string
  
  /**
   * Modal content
   */
  children: React.ReactNode
  
  /**
   * Custom header content (overrides title if provided)
   */
  header?: React.ReactNode
  
  /**
   * Custom footer content
   */
  footer?: React.ReactNode
  
  /**
   * Maximum width of modal
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  
  /**
   * Whether to close on backdrop click
   */
  closeOnBackdropClick?: boolean
  
  /**
   * Whether to close on ESC key
   */
  closeOnEscape?: boolean
  
  /**
   * Additional className for modal container
   */
  className?: string
  
  /**
   * Additional className for content area
   */
  contentClassName?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  header,
  footer,
  maxWidth = 'lg',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === modalRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 ${THEME.Z_INDEX.MODAL} flex items-center justify-center bg-black bg-opacity-50 p-4`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        className={cn(
          'w-full rounded-lg bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
          maxWidthClasses[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || header) && (
          <div className={`sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between ${THEME.Z_INDEX.DEFAULT}`}>
            {header ? (
              header
            ) : (
              <>
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'flex-1 overflow-y-auto',
            contentClassName || 'p-6'
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

