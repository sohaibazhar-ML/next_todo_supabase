"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Image } from '@/website/atoms';
import { AboutInfoProps } from '@/website/organisms/AboutInfo/AboutInfo.types';

export const AboutInfo: React.FC<AboutInfoProps> = ({ className = '' }) => {
  const t = useTranslations('About.Info');

  return (
    <section className={`w-full bg-background-secondary flex justify-center py-8 lg:py-12 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
        <div className="bg-white rounded-none shadow-sm overflow-hidden grid grid-cols-12">
          {/* Left: Image */}
          <div className="col-span-12 lg:col-span-6 order-2 lg:order-1 relative min-h-[400px] lg:min-h-full">
            <Image
              src="/assets/website/about-page/about-2.png"
              alt="MySwissMove Support"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right: Content */}
          <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center p-8 lg:p-16 gap-6">
            <Text variant="heading-l" className="text-secondary font-bold leading-tight">
              {t('title')}
            </Text>
            <Text variant="text-s" className="text-secondary/80 leading-relaxed">
              {t('description')}
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};
