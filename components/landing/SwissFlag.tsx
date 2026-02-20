/**
 * Swiss flag icon — small red square with white cross
 * Reusable across navbar, footer, etc.
 */

interface SwissFlagProps {
  size?: number;
  className?: string;
}

export default function SwissFlag({ size = 28, className = '' }: SwissFlagProps) {
  const crossSize = Math.round(size * 0.5)
  const barW = Math.round(crossSize * 0.27)
  const offset = (crossSize - barW) / 2

  return (
    <div
      className={`rounded-[2px] flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: '#e62e2d' }}
    >
      <svg width={crossSize} height={crossSize} viewBox={`0 0 ${crossSize} ${crossSize}`} fill="white">
        <rect x={offset} y={1} width={barW} height={crossSize - 2} />
        <rect x={1} y={offset} width={crossSize - 2} height={barW} />
      </svg>
    </div>
  )
}
