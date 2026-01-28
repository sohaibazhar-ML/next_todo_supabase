/**
 * Success Message Component
 * 
 * Reusable component for displaying success messages.
 * Similar to ErrorMessage but with success styling.
 */

import { CloseButton } from '@/components/ui'

interface SuccessMessageProps {
  message: string
  className?: string
  onDismiss?: () => void
}

export default function SuccessMessage({
  message,
  className = '',
  onDismiss,
}: SuccessMessageProps) {
  return (
    <div className={`bg-green-50 border-l-4 border-green-500 p-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-700">{message}</p>
        </div>
        {onDismiss && (
          <CloseButton
            onClick={onDismiss}
            className="ml-3 text-green-400 hover:text-green-600"
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
