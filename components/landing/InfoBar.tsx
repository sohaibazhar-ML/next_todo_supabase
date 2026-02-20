/**
 * InfoBar — thin strip below hero
 * Centered text: "Built for expats moving to Switzerland • Secure Swiss hosting"
 */

import { useTranslations } from 'next-intl'

export default function InfoBar() {
  const t = useTranslations('landing.infoBar')

  return (
    <div className="bg-[#e8e8e8] border-t border-[#d8d8d8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-center text-[12px] md:text-[13px] text-[#888] tracking-wide">
          {t('expatsLine')}
          <span className="mx-3">•</span>
          {t('secureLine')}
        </p>
      </div>
    </div>
  )
}
