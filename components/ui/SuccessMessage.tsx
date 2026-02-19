/**
 * Success Message Component
 * 
 * Reusable component for displaying success messages.
 * Similar to ErrorMessage but with success styling.
 */

import { CloseButton } from '@/components/ui'
import { IconSuccess as SuccessIcon } from '@/components/ui/icons'

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
          <SuccessIcon className="h-5 w-5 text-green-400" />
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
