/**
 * MyDocuments section — warm beige/olive background
 * Left: app-screenshot.png | Right: title, subtitle, red triangle checklist items, CTA
 */

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const CHECKLIST_KEYS = ['checkItem1', 'checkItem2', 'checkItem3', 'checkItem4', 'checkItem5'] as const

export default function MyDocuments() {
  const t = useTranslations('landing.myDocuments')

  return (
    <section id="my-documents" className="bg-[#edece6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: App Screenshot */}
          <div className="flex justify-center">
            <div className="w-full max-w-[480px] h-[280px] md:h-[320px] rounded-lg overflow-hidden relative shadow-md">
              <Image
                src="/images/app-screenshot.png"
                alt={t('imageAlt')}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-4">
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#333] leading-tight">
              {t('title')}
            </h2>
            <div className="space-y-0">
              <p className="text-[15px] md:text-[16px] text-[#444] leading-relaxed font-medium">
                {t('subtitle1')}
              </p>
              <p className="text-[15px] md:text-[16px] text-[#444] leading-relaxed font-bold">
                {t('subtitle2')}
              </p>
            </div>

            {/* Red Triangle Checklist */}
            <ul className="space-y-2.5 pt-2">
              {CHECKLIST_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="text-[#e62e2d] text-[14px] mt-[2px] flex-shrink-0">▲</span>
                  <span className="text-[14px] md:text-[15px] text-[#555] leading-snug">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-2.5 rounded text-[14px] font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#e62e2d' }}
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
