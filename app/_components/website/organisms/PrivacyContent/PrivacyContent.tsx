import React from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/website/atoms';
import { PrivacyContentProps } from './PrivacyContent.types';

export const PrivacyContent: React.FC<PrivacyContentProps> = ({ className = '' }) => {
  const t = useTranslations('Privacy');

  // Array of keys for the 7 sections (0 to 6)
  const sectionKeys = Array.from({ length: 7 }, (_, i) => i);

  const renderContentWithLinks = (text: string) => {
    if (!text) return null;
    const combinedRegex = /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)|(\b(?:https?:\/\/|www\.)[^\s]+\b)/g;
    const parts = text.split(combinedRegex);
    
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/)) {
        return (
          <a key={i} href={`mailto:${part}`} className="text-primary hover:underline font-bold transition-all">
            {part}
          </a>
        );
      }
      if (part.match(/^(?:https?:\/\/|www\.)[^\s]+$/)) {
        const url = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold transition-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <section className={`w-full py-16 bg-background-neutral ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full mx-auto px-(--spacing-container-padding) grid grid-cols-12 gap-x-(--spacing-gutter)">
        <div className="col-span-12 lg:col-span-12">
          <div className="mb-12">
            <Text variant="heading-m" className="text-secondary uppercase block">
              {renderContentWithLinks(t('title'))}
            </Text>
          </div>

          <div className="space-y-12 text-justify">
            {sectionKeys.map((key) => (
              <div key={key} className="space-y-4">
                <Text variant="heading-m" className="text-secondary">
                  {renderContentWithLinks(t(`sections.${key}.title`))}
                </Text>
                <div className="space-y-4">
                  {t(`sections.${key}.content`).split(/\n\n|(?=\n•)/).map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    const isBullet = trimmed.startsWith('•');
                    
                    if (isBullet) {
                      return (
                        <div key={pIdx} className="pl-8 flex items-start gap-x-4 ml-6">
                          <span className="text-lg font-bold leading-none select-none text-secondary">
                            •
                          </span>
                          <Text
                            variant="text-xxs"
                            className="text-secondary text-justify leading-relaxed block whitespace-pre-wrap flex-1"
                          >
                            {renderContentWithLinks(trimmed.substring(1).trim())}
                          </Text>
                        </div>
                      );
                    }

                    return (
                      <Text
                        key={pIdx}
                        variant="text-xxs"
                        className="text-secondary text-justify leading-relaxed block whitespace-pre-wrap"
                      >
                        {renderContentWithLinks(paragraph)}
                      </Text>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
