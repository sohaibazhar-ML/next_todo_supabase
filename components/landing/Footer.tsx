/**
 * Footer — dark charcoal gray background (#666)
 * Top area: left links (Über uns, FAQ) | center: phone icon + help text + form | right: submit button
 * Bottom bar: service info | legal links + hotline | partner logo
 * Matches reference image exactly
 */

import { useTranslations } from 'next-intl'
import CallbackForm from './CallbackForm'
import IconPhone from '@/components/ui/icons/IconPhone'

export default function Footer() {
  const t = useTranslations('landing')

  return (
    <footer id="kontakt" className="text-white" style={{ backgroundColor: '#666' }}>
      {/* Main Footer Area */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-6 items-start">
          {/* Left: Quick Links */}
          <div className="space-y-2">
            <a href="#" className="block text-[14px] text-white hover:text-[#e62e2d] transition-colors duration-200">
              {t('footer.aboutUs')}
            </a>
            <a href="#" className="block text-[14px] text-white hover:text-[#e62e2d] transition-colors duration-200">
              {t('footer.faq')}
            </a>
          </div>

          {/* Center + Right: Phone icon + Help text + Form */}
          <div className="space-y-4">
            {/* Phone icon + Help text */}
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-[#e62e2d] flex items-center justify-center flex-shrink-0">
                <IconPhone size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-semibold">{t('callback.title')}</p>
                <p className="text-[13px] opacity-90">{t('callback.subtitle')}</p>
              </div>
            </div>

            {/* Callback Form */}
            <CallbackForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#777]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#ccc]">
            {/* Service Info */}
            <p className="text-center md:text-left">
              {t('footer.serviceInfo')}
            </p>

            {/* Legal Links + Hotline */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#" className="hover:text-white transition-colors">{t('footer.impressum')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.datenschutz')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.agb')}</a>
              <span>
                {t('footer.hotlineLabel')}{' '}
                <span className="text-white font-medium">{t('footer.hotlineNumber')}</span>
              </span>
            </div>

            {/* Partner Label */}
            <div className="text-right flex items-center gap-2">
              <span className="text-[11px] leading-tight">{t('footer.partnerLabel')}</span>
              {/* Helvetia logo placeholder */}
              <span className="text-[16px] font-bold text-white tracking-tight" style={{ fontFamily: 'serif' }}>
                helvetia
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
