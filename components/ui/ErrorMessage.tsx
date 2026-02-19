/**
 * Reusable error message component
 */

import { CloseButton } from '@/components/ui'
import { IconError as ErrorIcon } from '@/components/ui/icons'

interface ErrorMessageProps {
  message: string
  className?: string
  onDismiss?: () => void
}

export default function ErrorMessage({ 
  message, 
  className = '',
  onDismiss 
}: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ErrorIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <CloseButton
            onClick={onDismiss}
            className="ml-3 text-red-400 hover:text-red-600"
            size="sm"
          />
        )}
      </div>
    </div>
  )
}

