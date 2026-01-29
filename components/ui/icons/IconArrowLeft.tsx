/**
 * Arrow Left Icon Component
 */

import { IconProps } from './IconDashboard'

export default function IconArrowLeft({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}
