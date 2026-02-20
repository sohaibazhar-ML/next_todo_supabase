/**
 * Landing page Logo — "myswissmove" with brand colors
 * "my" = gray, "swiss" = RED bold italic, "move" = gray
 * Tagline: "smart documents for your Swiss move"
 */

import { useTranslations } from 'next-intl'

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const t = useTranslations('landing.logo')

  return (
    <div className={`select-none ${className}`}>
      <div className="text-[24px] tracking-tight leading-none" style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}>
        <span className="font-normal" style={{ color: '#888' }}>my</span>
        <span className="font-bold italic" style={{ color: '#e62e2d' }}>swiss</span>
        <span className="font-normal" style={{ color: '#888' }}>move</span>
      </div>
      <p className="text-[9px] text-[#aaa] tracking-[0.02em] mt-[1px]" style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}>
        {t('tagline')}
      </p>
    </div>
  )
}
