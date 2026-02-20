/**
 * Desktop nav links — red anchor links pointing to section IDs
 * Extracted from Navbar for reusability and component size
 */

import { useTranslations } from 'next-intl'
import { NAV_LINKS } from '@/constants/landing'

export default function NavLinks() {
  const t = useTranslations('landing.nav')

  return (
    <nav className="hidden lg:flex items-center gap-[32px] ml-auto mr-8" aria-label="Main navigation">
      {NAV_LINKS.map((link) => (
        <a
          key={link.key}
          href={link.href}
          className="text-[15px] font-medium transition-colors duration-200 hover:opacity-80"
          style={{ color: '#e62e2d' }}
        >
          {t(link.key)}
        </a>
      ))}
    </nav>
  )
}
