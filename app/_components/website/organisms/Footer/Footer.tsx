"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input, Text, Image, Button, DateTimeInput } from '@/website/atoms';
import { FooterProps } from '@/website/organisms/Footer/Footer.types';

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const t = useTranslations('Footer');

  return (
    <footer id="contact" className="w-full bg-background-dark flex justify-center pt-16 pb-10 text-white h-auto">
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex flex-col gap-14">
        <div className="grid grid-cols-12 gap-x-(--spacing-gutter) gap-y-12 items-start">
          {/* Column 1: Links Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:pt-[76px]">
            <Link href="/about" className="block w-fit">
              <Text variant="text-xs" className="text-white font-normal text-[23px] hover:text-white/80 transition-colors">{t('about')}</Text>
            </Link>
            <Link href="/faq" className="block w-fit">
              <Text variant="text-xs" className="text-white font-normal text-[23px] hover:text-white/80 transition-colors">{t('faq')}</Text>
            </Link>
            <div className="pt-8">
              <Text variant="text-xxs" className="text-white font-normal text-[21px] leading-tight w-[263px] max-w-[263px]">
                {t('service')}
              </Text>
            </div>
          </div>

          {/* Column 2: Main Contact & Legal section */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* Top: Phone icon & Questions */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">
                  <Image
                    src="/assets/website/icons/Button_phone 2.png"
                    alt="Phone"
                    width={50.58}
                    height={50}
                    className="w-12 h-auto object-contain"
                  />
                </div>
                <Text variant="text-xs" className="text-white font-medium text-[22px] leading-snug max-w-[437px]">
                  {t('questions')}
                </Text>
              </div>

              {/* Form Inputs & CTA Button */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 w-full">
                <div className="flex flex-col gap-4 w-full max-w-[513px]">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input
                      id="footer-name"
                      label={t('form.name')}
                      labelClassName="sr-only"
                      placeholder={t('form.name')}
                      className="w-[315px]"
                      inputClassName="!h-[36px] !min-h-0"
                      type='text'
                    />
                    <DateTimeInput
                      id="footer-time"
                      name="preferred_time"
                      label={t('form.time')}
                      labelClassName="sr-only"
                      placeholder={t('form.time')}
                      className="w-[182px]"
                      inputClassName="!h-[36px] !min-h-0"
                    />
                  </div>
                  <Input
                    id="footer-phone"
                    label={t('form.phone')}
                    labelClassName="sr-only"
                    placeholder={t('form.phone')}
                    className="w-full"
                    inputClassName="!h-[36px] !min-h-0"
                  />
                </div>

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

            {/* Bottom: Legal Links & Logo aligned with Form & CTA */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-y-10 w-full pt-4">
              {/* This div aligns with the Left edge of Inputs (513px group) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-x-8 xl:gap-x-12 gap-y-4 max-w-[513px]">
                <Link href="/imprint">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.imprint')}
                  </Text>
                </Link>
                <Link href="/privacy">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.privacy')}
                  </Text>
                </Link>
                <Link href="/terms">
                  <Text variant="text-xs" className="text-white font-normal text-[18px] hover:text-white/80 transition-colors whitespace-nowrap">
                    {t('links.terms')}
                  </Text>
                </Link>
                <Text variant="text-xs" className="text-white font-normal text-[18px] whitespace-nowrap">
                  {t('links.hotline')}
                </Text>
              </div>

              {/* Partnership logo aligned with CTA radius */}
              <div className="flex flex-col items-start lg:items-end gap-1 mb-[-4px]">
                <Text variant="text-xxs" className="text-white/60 lowercase italic !text-[11px] lg:mr-4">
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
