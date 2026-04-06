"use client";

import React from 'react';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Image, Text } from '@/website/atoms';
import { DocumentRowProps } from '@/website/molecules/DocumentRow/DocumentRow.types';

export const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  index,
  className = ''
}) => {
  const t = useTranslations('Dashboard.list');

  const iconSrc = document.type === 'pdf'
    ? '/assets/website/dashboard/pdf.png'
    : '/assets/website/dashboard/word.png';

  return (
    <div className={`w-full flex items-center h-[34px] px-4 transition-colors hover:bg-black/5 bg-white border border-secondary/5 rounded-[4px] mb-1 ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 flex items-center justify-center">
        <Image
          src={iconSrc}
          alt={document.type}
          width={14}
          height={14}
          className="object-contain h-auto"
        />
      </div>

      {/* Separator */}
      <div className="h-4 md:h-6 w-[1px] bg-secondary/10 mx-3 md:mx-6" />

      {/* Name with Marquee on Hover - Mobile Only */}
      <div className="flex-1 min-w-0 overflow-hidden ml-2 md:ml-0">
        <div className="max-md:hover-marquee group/marquee flex items-center h-full">
          <Text variant="text-xxs" className="text-secondary font-medium truncate md:whitespace-normal md:overflow-visible overflow-hidden transition-all duration-300">
            {document.name}
          </Text>
        </div>
      </div>

      {/* Separator - Left of Size - Desktop Only */}
      <div className="hidden md:block h-6 w-[1px] bg-secondary/10 mx-6 flex-shrink-0" />

      {/* Size - Now visible earlier */}
      <div className="flex w-16 md:w-24 lg:w-32 justify-center flex-shrink-0">
        <Text variant="text-xxs" className="text-secondary text-[10px] md:text-[12px]">
          {document.size}
        </Text>
      </div>

      {/* Download Action */}
      <a
        href={document.url}
        download
        className="flex items-center gap-2 md:gap-3 text-secondary transition-opacity hover:opacity-70 ml-2 md:ml-4 group flex-shrink-0"
      >
        <Text variant="text-xxs" className="font-bold hidden md:block">
          {t('download')}
        </Text>
        <Download size={16} className="text-secondary group-hover:text-secondary" />
      </a>
    </div>
  );
};
