"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Image } from '@/website/atoms';
import { AboutPartnersProps } from '@/website/organisms/AboutPartners/AboutPartners.types';

export const AboutPartners: React.FC<AboutPartnersProps> = ({ className = '' }) => {
  const t = useTranslations('About.Partners');

  const partners = [
    {
      id: 'mehrwerk',
      logo: '/assets/website/about-page/Logo_mehrwerk.png',
      linkText: t('mehrwerk.linkText'),
      url: 'https://www.mehrwerk.com'
    },
    {
      id: 'helvetia',
      logo: '/assets/website/about-page/Logo_helvetia.png',
      linkText: t('helvetia.linkText'),
      url: 'https://www.helvetia.com/ch/web/de/privatkunden/versicherungen/zuzuegerversicherung.html'
    }
  ];

  return (
    <section className={`w-full bg-background-neutral flex justify-center py-12 lg:py-16 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
        <div className="bg-white rounded-none shadow-sm pt-16 px-12 lg:px-24 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          {partners.map((partner) => (
            <div key={partner.id} className="flex-1 w-full flex flex-col items-center gap-8 group">
              <div className="relative h-20 w-full max-w-[300px]">
                <a
                  href={partner.id === 'helvetia' ? 'https://www.helvetia.com/ch/web/de/privatkunden/versicherungen/zuzuegerversicherung.html' : partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.id}
                    fill
                    sizes="300px"
                    className="object-contain"
                  />
                </a>
              </div>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mt-auto"
              >
                <Text variant="text-xxs" className="text-secondary/60 hover:text-primary transition-colors">
                  {partner.linkText}
                </Text>
                <div className="relative w-10 h-10 grayscale group-hover:grayscale-0 transition-all">
                  <Image
                    src="/assets/website/about-page/hand-pointer.png"
                    alt="Pointer"
                    fill
                    sizes="40px"
                    className="object-contain group-hover:translate-y-[-2px] transition-transform"
                  />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
