"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button } from '@/website/atoms';

export const DashboardOverview: React.FC = () => {
  const t = useTranslations('Dashboard');

  const overviewItems = [
    { label: t('overview.labels.mandatory'), title: t('overview.titles.gemeinde') },
    { label: t('overview.labels.mandatory'), title: t('overview.titles.krankenkasse') },
    { label: t('overview.labels.important'), title: t('overview.titles.internet') },
    { label: t('overview.labels.important'), title: t('overview.titles.bank') },
    { label: t('overview.labels.optional'), title: t('overview.titles.post') },
    { label: t('overview.labels.mandatory'), title: t('overview.titles.auto') },
    { label: t('overview.labels.important'), title: t('overview.titles.creditcard') },
    { label: t('overview.labels.optional'), title: t('overview.titles.friends') },
    { label: t('overview.labels.mandatory'), title: t('overview.titles.pet') },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Progress Bar Section */}
      <div className="flex flex-col gap-2">
        <Text variant="text-s" className="text-secondary font-medium">
          {t('overview.progress', { percent: 70 })}
        </Text>
        <div className="w-full max-w-xl h-6 bg-gray-400 flex">
          <div className="h-full bg-primary w-[70%]" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewItems.map((item, idx) => (
          <div key={idx} className="bg-white p-6 shadow-sm flex flex-col gap-4 min-h-[160px] justify-between">
            <div className="flex flex-col gap-2">
              <Text variant="text-s" className="text-primary font-bold">
                {item.label}
              </Text>
              <Text variant="text-m" className="text-secondary font-medium">
                {item.title}
              </Text>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              className="bg-primary hover:bg-primary-hover text-white w-fit px-6 rounded-none font-bold"
            >
              {t('list.download')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
