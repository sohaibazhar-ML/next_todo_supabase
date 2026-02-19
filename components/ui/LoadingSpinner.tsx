/**
 * Reusable loading spinner component
 */

import { IconSpinner } from '@/components/ui/icons'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <IconSpinner className={`${sizeClasses[size]} text-indigo-600`} />
      {text && (
        <p className={`mt-4 text-gray-600 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {text}
        </p>
      )}
    </div>
  )
}

