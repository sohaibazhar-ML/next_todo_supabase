/**
 * Swiss Flag Icon Component
 *
 * Red square with white cross — the Swiss national flag.
 * Extracted from components/landing/SwissFlag.tsx for reuse.
 */

import { IconProps } from './IconDashboard'

export default function IconSwissFlag({ size = 28, className = '', ...props }: IconProps) {
    const numSize = typeof size === 'string' ? parseInt(size, 10) : size
    const crossSize = Math.round(numSize * 0.5)
    const barW = Math.round(crossSize * 0.27)
    const offset = (crossSize - barW) / 2

    return (
        <svg
            className={className}
            width={crossSize}
            height={crossSize}
            viewBox={`0 0 ${crossSize} ${crossSize}`}
            fill="white"
            {...props}
        >
            <rect x={offset} y={1} width={barW} height={crossSize - 2} />
            <rect x={1} y={offset} width={crossSize - 2} height={barW} />
        </svg>
    )
}
