/**
 * Desktop nav actions — Login (bordered), CTA (red filled), Swiss flag
 * Extracted from Navbar for reusability and component size
 */

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import SwissFlag from './SwissFlag'

export default function NavActions() {
  const t = useTranslations('landing.nav')

  return (
    <div className="hidden lg:flex items-center gap-[12px]">
      {/* Login — thin bordered rectangle */}
      <Link
        href="/login"
        className="px-[20px] py-[7px] text-[14px] font-normal text-[#333] border border-[#bbb] hover:border-[#888] transition-colors duration-200"
      >
        {t('login')}
      </Link>

      {/* CTA — red filled, slightly rounded */}
      <Link
        href="/signup"
        className="px-[18px] py-[7px] rounded-[3px] text-[14px] font-semibold text-white transition-all duration-200 hover:brightness-90"
        style={{ backgroundColor: '#e62e2d' }}
      >
        {t('register')}
      </Link>

      {/* Swiss flag */}
      <SwissFlag size={28} className="ml-[4px]" />
    </div>
  )
}
