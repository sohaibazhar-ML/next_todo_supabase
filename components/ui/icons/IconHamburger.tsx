/**
 * Hamburger Menu Icon for mobile navigation
 */

import { IconProps } from './IconDashboard'

export default function IconHamburger({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )
}
