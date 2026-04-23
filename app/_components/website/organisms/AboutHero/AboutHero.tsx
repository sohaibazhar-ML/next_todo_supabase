"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Image } from '@/website/atoms';

import { AboutHeroProps } from '@/website/organisms/AboutHero/AboutHero.types';

export const AboutHero: React.FC<AboutHeroProps> = ({ className = '' }) => {
  const t = useTranslations('About.Hero');

  return (
    <section className={`w-full bg-background-neutral flex justify-center py-12 lg:py-16 ${className} mt-10`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
        <div className="bg-white rounded-none shadow-sm overflow-hidden grid grid-cols-12">
          {/* Left: Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center p-8 lg:p-16 gap-6">
            <Text as="h1" className="text-secondary font-semibold text-[43px] [font-stretch:85%] leading-tight">
              {t('title')}
            </Text>
            <Text className="text-secondary font-semibold text-[29px] [font-stretch:85%] leading-snug">
              {t('subtitle')}
            </Text>
            <Text className="text-secondary font-medium text-[24px] leading-relaxed whitespace-pre-line">
              {t('description')}
            </Text>
          </div>

          {/* Right: Image */}
          <div className="col-span-12 lg:col-span-6 relative min-h-[400px] lg:min-h-full">
            <Image
              src="/assets/website/about-page/about-1.png"
              alt="About MySwissMove"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
