/**
 * AllDocuments section — light gray background
 * Left: title, description paragraph, red checkbox checklist
 * Right: moving-image.png (couple with boxes)
 */

import Image from 'next/image'
import { useTranslations } from 'next-intl'

const BENEFIT_KEYS = ['benefit1', 'benefit2', 'benefit3', 'benefit4'] as const

export default function AllDocuments() {
  const t = useTranslations('landing.allDocuments')

  return (
    <section className="bg-[#f0f0f0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 items-start">
          {/* Left: Content */}
          <div className="space-y-5">
            <h2 className="text-[24px] md:text-[30px] font-bold text-[#333] leading-tight">
              {t('title')}
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#666] leading-relaxed">
              {t('description')}
            </p>

            {/* Red Checkbox Checklist */}
            <ul className="space-y-2.5 pt-1">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-[1px]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="1" y="1" width="16" height="16" rx="2" stroke="#e62e2d" strokeWidth="1.5" fill="white" />
                      <path d="M4.5 9L7.5 12L13.5 6" stroke="#e62e2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] md:text-[15px] text-[#555] leading-snug font-medium">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Moving Image */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[380px] h-[250px] md:h-[280px] rounded-lg overflow-hidden relative">
              <Image
                src="/images/moving-image.png"
                alt={t('imageAlt')}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
