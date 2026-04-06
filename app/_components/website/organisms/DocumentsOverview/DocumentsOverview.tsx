"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Image } from '@/website/atoms';
import { DocumentsOverviewProps } from '@/website/organisms/DocumentsOverview/DocumentsOverview.types';

export const DocumentsOverview: React.FC<DocumentsOverviewProps> = ({ className = '' }) => {
  const t = useTranslations('DocumentsOverview');

  const list = [
    t('list.0'),
    t('list.1'),
    t('list.2'),
    t('list.3')
  ];

  return (
    <section className={`w-full bg-background-neutral flex justify-center py-16 pb-24 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex flex-col gap-12">
        {/* Top: Heading */}
        <div className="w-full">
          <Text variant="heading-l" as="h2" className="text-secondary leading-tight">
            {t('title')}
          </Text>
        </div>

        <div className="grid grid-cols-12 gap-x-(--spacing-gutter) items-start">
          {/* Left: Content */}
          <div className="col-span-12 lg:col-span-7 space-y-10">
            <Text variant="text-m" className="text-secondary/80 max-w-[640px] leading-relaxed">
              {t('description')}
            </Text>

            <div className="flex flex-col gap-6">
              {list.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-1">
                    <Image
                      src="/assets/website/icons/check-icon.png"
                      alt="Check"
                      width={19}
                      height={17}
                      className="w-[18px] h-auto object-contain"
                    />
                  </div>
                  <Text variant="text-xxs" className="font-semibold text-secondary leading-tight pt-0.5">
                    {item}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Documents Overview Image */}
          <div className="col-span-12 lg:col-span-5 relative h-[240px] md:h-[320px] lg:h-auto lg:min-h-[400px] mt-10 lg:mt-0">
            <div className="absolute inset-0 shadow-lg overflow-hidden">
              <Image
                src="/assets/website/landing-page/doc-overview.png"
                alt="Documents Overview"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
