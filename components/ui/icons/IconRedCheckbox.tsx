/**
 * Red Checkbox Icon Component
 *
 * Red-bordered checkbox with checkmark — used in landing page benefit lists.
 * Extracted from components/landing/AllDocuments.tsx for reuse.
 */

import { IconProps } from './IconDashboard'

export default function IconRedCheckbox({ size = 18, className = '', ...props }: IconProps) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 18 18"
            fill="none"
            {...props}
        >
            <rect x="1" y="1" width="16" height="16" rx="2" stroke="#e62e2d" strokeWidth="1.5" fill="white" />
            <path d="M4.5 9L7.5 12L13.5 6" stroke="#e62e2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
