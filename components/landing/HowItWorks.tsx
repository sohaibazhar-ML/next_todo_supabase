/**
 * HowItWorks — 3-step section on light gray background
 * Steps are laid out in a 3-column grid, each with number LEFT of text
 */

import { useTranslations } from 'next-intl'
import StepCard from './StepCard'
import { STEPS } from '@/constants/landing'

export default function HowItWorks() {
  const t = useTranslations('landing.howItWorks')

  return (
    <section id="so-gehts" className="bg-[#f0f0f0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <h2 className="text-center text-[24px] md:text-[28px] font-bold text-[#555] mb-8 md:mb-10">
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={t(step.titleKey)}
              description={t(step.descKey)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
