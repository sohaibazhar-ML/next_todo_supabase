"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Image } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { HeroProps } from '@/website/organisms/Hero/Hero.types';

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const t = useTranslations('Hero');

  return (
    <section className={`w-full bg-background-neutral flex justify-center py-8 md:py-12 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
        <div className="bg-white w-full grid grid-cols-12 overflow-hidden shadow-sm">
          {/* Left: Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center p-8 lg:p-12 xl:p-20 bg-white">
            <Text variant="heading-l" className="text-secondary mb-4 lg:mb-6 leading-[1.1] xl:leading-[1.2]">
              {t('heading')}
            </Text>
            <Text variant="text-m" className="text-secondary mb-6 lg:mb-10 max-w-[540px] leading-relaxed">
              {t('subheading')}
            </Text>
            <div className="flex">
              <Link href="/register">
                <Button 
                  variant="primary" 
                  className="!h-auto py-[8.5px] px-[16px]"
                  textClassName="text-[20px] font-medium"
                >
                  {t('register')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="col-span-12 lg:col-span-6 relative min-h-[300px] lg:min-h-[400px] xl:min-h-[500px]">
            <Image 
              src="/assets/website/landing-page/hero.png" 
              alt="MySwissMove Hero" 
              fill 
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
