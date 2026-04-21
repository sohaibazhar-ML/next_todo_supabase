"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/website/atoms';
import { TrustBarProps } from '@/website/molecules/TrustBar/TrustBar.types';

export const TrustBar: React.FC<TrustBarProps> = ({ className = '' }) => {
  const t = useTranslations('TrustBar');

  return (
    <div className={`w-full bg-background-secondary flex justify-center py-3 ${className}`}>
      <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex items-center justify-center gap-3">
        <span style={{ fontSize: '18px', fontWeight: 600, fontStretch: '85%' }} className="text-secondary/70 font-heading">
          {t('expats')}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 600, fontStretch: '85%' }} className="text-secondary/30 font-heading">
          •
        </span>
        <span style={{ fontSize: '18px', fontWeight: 600, fontStretch: '85%' }} className="text-secondary/70 font-heading">
          {t('hosting')}
        </span>
      </div>
    </div>
  );
};
