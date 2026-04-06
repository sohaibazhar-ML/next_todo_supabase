"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/website/atoms';
import { TrustBarProps } from '@/website/molecules/TrustBar/TrustBar.types';

export const TrustBar: React.FC<TrustBarProps> = ({ className = '' }) => {
  const t = useTranslations('TrustBar');

  return (
    <div className={`w-full bg-background-secondary flex justify-center py-3 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex items-center justify-center gap-3 font-body text-[13px] md:text-[14px] text-secondary/70 font-medium">
        <Text variant="text-xs" className="text-secondary/70 font-medium">{t('expats')}</Text>
        <Text variant="text-xs" className="text-secondary/30">•</Text>
        <Text variant="text-xs" className="text-secondary/70 font-medium">{t('hosting')}</Text>
      </div>
    </div>
  );
};
