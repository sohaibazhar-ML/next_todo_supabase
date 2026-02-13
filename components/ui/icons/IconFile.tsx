/**
 * File Icon Component
 */

import { IconProps } from './IconDashboard'

export default function IconFile({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 20 20"
      {...props}
    >
      <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
    </svg>
  )
}

