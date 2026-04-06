"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input, Text, Image, Button, DateTimeInput } from '@/website/atoms';
import { FooterProps } from '@/website/organisms/Footer/Footer.types';

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const t = useTranslations('Footer');

  return (
    <footer id="contact" className="w-full bg-background-dark flex justify-center pt-16 pb-12 text-white min-h-[450px] h-auto">
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex flex-col justify-between">
        {/* Top: Call-back Form */}
        <div className="grid grid-cols-12 gap-x-(--spacing-gutter) items-start lg:ml-[15%] xl:ml-[25%] lg:mr-0">
          <div className="col-span-12 flex flex-col gap-6">
            {/* Question Text with Icon */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0">
                <Image
                  src="/assets/website/icons/Button_phone 2.png"
                  alt="Phone"
                  width={51}
                  height={50}
                  className="w-12 h-auto object-contain"
                />
              </div>
              <Text variant="text-xs" className="text-white leading-snug">
                {t('questions')}
              </Text>
            </div>

            {/* Form Inputs and Circular Button */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 w-full">
              <div className="flex flex-col gap-4 w-full lg:max-w-[600px]">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Input
                    id="footer-name"
                    label={t('form.name')}
                    labelClassName="sr-only"
                    placeholder={t('form.name')}
                    className="flex-1 min-w-0"
                    type='text'
                  />
                  <DateTimeInput
                    id="footer-time"
                    name="preferred_time"
                    label={t('form.time')}
                    labelClassName="sr-only"
                    placeholder={t('form.time')}
                    className="flex-1 sm:flex-[0.6] min-w-0"
                  />
                </div>
                <Input
                  id="footer-phone"
                  label={t('form.phone')}
                  labelClassName="sr-only"
                  placeholder={t('form.phone')}
                  className="w-full"
                />
              </div>

              {/* Circular Action Button */}
              <Button
                variant="unstyled"
                className="relative w-[80px] h-[80px] p-0 flex-shrink-0 transition-transform hover:scale-105 active:scale-95 border-none bg-transparent hover:bg-transparent"
              >
                <Image
                  src="/assets/website/icons/Button_call-me-back 1.png"
                  alt={t('form.cta')}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Middle: Links and Info */}
        <div className="grid grid-cols-12 gap-y-10 lg:gap-y-0">
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Link href="/about" className="block ">
              <Text variant="text-xs" className="font-semibold hover:text-white/80 transition-colors">{t('about')}</Text>
            </Link>
            <Link href="/faq" className="block ">
              <Text variant="text-xs" className="font-semibold hover:text-white/80 transition-colors">{t('faq')}</Text>
            </Link>
            <div className="pt-8">
              <Text variant="text-xxs" className="text-white leading-relaxed max-w-[240px]">
                {t('service')}
              </Text>
            </div>
          </div>

          {/* Bottom Row Area (Spanning Middle and Right) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col justify-end">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mt-auto">
              {/* Middle: Legal Links & Hotline */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-x-8 xl:gap-x-12 gap-y-6 w-full lg:max-w-[800px] lg:ml-8 xl:ml-0">
                <Link href="/imprint">
                  <Text variant="text-xs" className="text-white hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.imprint')}
                  </Text>
                </Link>
                <Link href="/privacy">
                  <Text variant="text-xs" className="text-white hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.privacy')}
                  </Text>
                </Link>
                <Link href="/terms">
                  <Text variant="text-xs" className="text-white hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.terms')}
                  </Text>
                </Link>

                <Text variant="text-xs" className="text-white font-medium whitespace-nowrap">
                  {t('links.hotline')}
                </Text>
              </div>

              {/* Right: Partnership */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <Text variant="text-xxs" className="text-white/60 lowercase italic !text-[11px]">
                  {t('partnership')}
                </Text>
                <Image
                  src="/assets/website/logos/Logo_helvetia_022026 1.png"
                  alt="Helvetia"
                  width={293}
                  height={56}
                  className="w-[160px] h-auto brightness-0 invert object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
