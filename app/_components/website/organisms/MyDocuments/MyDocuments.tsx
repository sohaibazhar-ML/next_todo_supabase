"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button, Image } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { MyDocumentsProps } from '@/website/organisms/MyDocuments/MyDocuments.types';

export const MyDocuments: React.FC<MyDocumentsProps> = ({ className = '' }) => {
  const t = useTranslations('MyDocuments');

  // Explicitly casting the array from translations
  const list = [
    t('list.0'),
    t('list.1'),
    t('list.2'),
    t('list.3'),
    t('list.4')
  ];

  return (
    <section id="my-documents" className={`w-full bg-background-secondary flex justify-center py-16 pb-24 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) grid grid-cols-12 gap-x-(--spacing-gutter) items-center">
        {/* Left: Image/Preview */}
        <div className="col-span-12 lg:col-span-5 mb-10 lg:mb-0">
          <div className="bg-white py-8 px-3 flex items-center justify-center">
            <div className="relative w-full aspect-[653/430]">
              <Image
                src="/assets/website/landing-page/mydocuments.png"
                alt="My Documents Preview"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="col-span-12 lg:col-span-7 pl-0 lg:pl-12">
          <Text 
            variant="heading-l" 
            as="h2" 
            style={{ fontSize: '43px', fontWeight: 600, fontStretch: '85%' }}
            className="text-secondary mb-2"
          >
            {t('title')}
          </Text>
          <Text 
            style={{ fontSize: '27px', fontWeight: 500, fontStretch: '85%' }} 
            className="text-secondary mb-0"
          >
            {t('subtitle')}
          </Text>
          <Text 
            style={{ fontSize: '27px', fontWeight: 500, fontStretch: '85%' }} 
            className="text-secondary mb-4 max-w-[600px]"
          >
            {t('description')}
          </Text>

          <ul className="space-y-2 mb-6">
            {list.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <Image
                    src="/assets/website/icons/red-down-arrow-icon.png"
                    alt="Bullet"
                    width={16}
                    height={16}
                    className="w-3 h-auto object-contain"
                  />
                </div>
                <Text 
                  as="span" 
                  style={{ fontSize: '21px', fontWeight: 500 }} 
                  className="text-secondary leading-snug"
                >
                  {item}
                </Text>
              </li>
            ))}
          </ul>

          <div className="flex">
            <Link href="/register">
              <Button size="sm" variant="primary">
                {t('register')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
