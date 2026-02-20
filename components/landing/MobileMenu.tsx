/**
 * Mobile navigation drawer — links, language switcher, Login, CTA
 * Extracted from Navbar so the parent stays small and focused
 */

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { NAV_LINKS } from '@/constants/landing'

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const t = useTranslations('landing.nav')

  return (
    <div className="lg:hidden border-t border-gray-200 bg-white">
      <nav className="px-6 py-4 space-y-3" aria-label="Mobile navigation">
        {NAV_LINKS.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className="block text-[15px] font-medium py-2"
            style={{ color: '#e62e2d' }}
            onClick={onClose}
          >
            {t(link.key)}
          </a>
        ))}
        <div className="pt-3 border-t border-gray-200 space-y-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="block text-center px-5 py-2 text-[14px] font-normal text-[#333] border border-[#bbb]"
            onClick={onClose}
          >
            {t('login')}
          </Link>
          <Link
            href="/signup"
            className="block text-center px-5 py-2 rounded-[3px] text-[14px] font-semibold text-white"
            style={{ backgroundColor: '#e62e2d' }}
            onClick={onClose}
          >
            {t('register')}
          </Link>
        </div>
      </nav>
    </div>
  )
}
