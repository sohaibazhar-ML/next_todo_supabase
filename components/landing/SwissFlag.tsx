/**
 * Swiss flag icon — small red square with white cross
 * Reusable across navbar, footer, etc.
 * SVG logic extracted to components/ui/icons/IconSwissFlag.tsx
 */

import IconSwissFlag from '@/components/ui/icons/IconSwissFlag'

interface SwissFlagProps {
  size?: number;
  className?: string;
}

export default function SwissFlag({ size = 28, className = '' }: SwissFlagProps) {
  return (
    <div
      className={`rounded-[2px] flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: '#e62e2d' }}
    >
      <IconSwissFlag size={size} />
    </div>
  )
}
