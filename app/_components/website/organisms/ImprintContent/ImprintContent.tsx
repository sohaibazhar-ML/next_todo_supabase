import React from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/website/atoms';
import { ImprintContentProps } from './ImprintContent.types';

export const ImprintContent: React.FC<ImprintContentProps> = ({ className = '' }) => {
  const t = useTranslations('Imprint');

  return (
    <section className={`w-full py-16 bg-background-neutral ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full mx-auto px-(--spacing-container-padding) grid grid-cols-12 gap-x-(--spacing-gutter)">
        <div className="col-span-12 lg:col-span-12">
          <Text variant="heading-m" className="mb-8 text-secondary uppercase">
            {t('title')}
          </Text>

          <div className="space-y-12">
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <Text variant="text-xs" className="text-secondary">
                  {t('company')}
                </Text>
                <Text variant="text-xs" className="text-secondary">
                  {t('addressLine')}
                </Text>
                <Text variant="text-xs" className="text-secondary">
                  {t('cityLine')}
                </Text>
                <Text variant="text-xs" className="text-secondary">
                  {t('phone')}
                </Text>
                <Text variant="text-xs" className="text-secondary">
                  Email: <a href="mailto:hello@myswissmove.ch" className="hover:underline text-accent">hello@myswissmove.ch</a>
                </Text>
                <Text variant="text-xs" className="text-secondary">
                  {t('director')}
                </Text>
              </div>
            </div>

            {/* Registry Info */}
            <div className="space-y-1">
              <Text variant="text-xs" className="text-secondary">
                {t('registry')}
              </Text>
              <Text variant="text-xs" className="text-secondary">
                {t('regNumber')}
              </Text>
              <Text variant="text-xs" className="text-secondary">
                {t('vatId')}
              </Text>
              <Text variant="text-xs" className="text-secondary mt-1">
                {t('responsible')}
              </Text>
            </div>

            {/* Image Sources */}
            <div className="space-y-2">
              <Text variant="text-xs" className="text-secondary">
                {t('imageSources.title')}
              </Text>
              <ul className="list-none space-y-1">
                {['pexels', 'pixabay'].map((key) => {
                  const source = t(`imageSources.${key}`);
                  const [name, url] = source.split(' - ');
                  return (
                    <li key={key}>
                      <Text variant="text-xs" className="text-secondary flex items-center gap-1">
                        • © {name} - <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">{url}</a>
                      </Text>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Disclaimer Sections */}
            <div className="pt-2 border-border-input flex gap-2">
              <Text variant="text-s" className="text-secondary shrink-0">
                {t('disclaimer')}
              </Text>
            </div>

            {/* Liability Content */}
            <div>
              <Text variant="text-s" className="font-bold text-secondary mb-4 inline-block">
                {t('liabilityContent.title')}
              </Text>
              <Text variant="text-xs" className="text-secondary leading-normal block">
                {t('liabilityContent.content')}
              </Text>
            </div>

            {/* Liability Links */}
            <div>
              <Text variant="text-s" className="font-bold text-secondary mb-4 inline-block">
                {t('liabilityLinks.title')}
              </Text>
              <Text variant="text-xs" className="text-secondary leading-normal block whitespace-pre-line">
                {t('liabilityLinks.content')}
              </Text>
            </div>

            {/* Copyright */}
            <div>
              <Text variant="text-s" className="font-bold text-secondary mb-4 inline-block">
                {t('copyright.title')}
              </Text>
              <Text variant="text-xs" className="text-secondary leading-normal block">
                {t('copyright.content')}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
