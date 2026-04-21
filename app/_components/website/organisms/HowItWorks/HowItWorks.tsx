"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/website/atoms';
import { HowItWorksProps } from '@/website/organisms/HowItWorks/HowItWorks.types';

export const HowItWorks: React.FC<HowItWorksProps> = ({ className = '' }) => {
  const t = useTranslations('HowItWorks');

  const steps = [
    { id: '01', text: t('step1') },
    { id: '02', text: t('step2') },
    { id: '03', text: t('step3') },
  ];

  return (
    <section id="how-it-works" className={`w-full bg-background-neutral flex justify-center py-8 md:py-12 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
        <div className="bg-white w-full py-12 px-6 md:px-16 flex flex-col items-center">
          <Text as="h2" style={{ fontSize: '43px', fontWeight: 600, fontStretch: '85%' }} className="text-secondary mb-12 md:mb-16">
            {t('title')}
          </Text>

          <div className="flex flex-col md:flex-row justify-between w-full gap-10 md:gap-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4 flex-1">
                <Text
                  as="span"
                  style={{ fontSize: '72px', fontWeight: 400 }}
                  className="text-secondary leading-none"
                >
                  {step.id}
                </Text>
                <Text
                  style={{ fontSize: '24px', fontWeight: 500 }}
                  className="text-secondary leading-tight max-w-[270px]"
                >
                  {step.text}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
