/**
 * Hero section — pixel-perfect match to reference
 * - Same bg as navbar (#f5f5f5) — seamless
 * - Left side: WHITE background panel containing headline, subheadline, CTA
 * - Right side: hero.png image, flush with edges
 * - The white panel overlaps/sits within the gray bg area
 */

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function HeroSection() {
  const t = useTranslations('landing.hero')

  return (
    <section className="bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-[400px] md:min-h-[440px]">
          {/* Left: White text panel */}
          <div className="bg-white flex items-center">
            <div className="px-8 md:px-10 lg:px-12 py-10 md:py-14">
              <h1 className="text-[24px] sm:text-[28px] md:text-[30px] lg:text-[32px] leading-[1.18] font-bold text-[#333] mb-5">
                {t('headline')}
              </h1>
              <p className="text-[20px] md:text-[22px] leading-[1.6] text-[#333] mb-7">
                {t('subheadline')}
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center px-[20px] py-[9px] rounded-[3px] text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-90 border border-[#c22]"
                style={{ backgroundColor: '#e62e2d' }}
              >
                {t('cta')}
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative min-h-[280px] md:min-h-[440px]">
            <Image
              src="/images/hero.png"
              alt={t('imageAlt')}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
