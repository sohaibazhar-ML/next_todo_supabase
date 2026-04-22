"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button } from '@/website/atoms';

interface DocumentCard {
  id: string;
  title: string;
  category: string;
  is_mandatory?: boolean; // We'll map this or use is_featured
}

interface DashboardOverviewProps {
  progressPercent?: number;
  featuredDocuments?: any[];
  checklistCards?: any[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  progressPercent = 0,
  featuredDocuments = [],
  checklistCards = []
}) => {
  const t = useTranslations('Dashboard');

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Progress Bar Section */}
      <div className="flex flex-col gap-2">
        <Text variant="text-s" className="text-secondary font-medium">
          {t('overview.progress', { percent: progressPercent })}
        </Text>
        <div className="w-full max-w-xl h-6 bg-gray-100 flex rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklistCards.length > 0 ? (
          checklistCards.map((item, idx) => (
            <div key={item.id || idx} className="bg-white p-6 shadow-sm border border-gray-50 flex flex-col gap-4 min-h-[160px] justify-between transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-2">
                <Text variant="text-s" className={`${item.is_mandatory ? 'text-primary' : 'text-gray-400'} font-bold uppercase tracking-wider`}>
                  {item.is_mandatory ? t('overview.labels.mandatory') : t('overview.labels.optional')}
                </Text>
                <Text variant="text-m" className="text-secondary font-semibold">
                  {item.title}
                </Text>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white w-fit px-6 rounded-none font-bold shadow-sm"
                onClick={() => window.location.href = `/dashboard/checklist`}
              >
                {t('list.download')}
              </Button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">
            <Text variant="text-m" className="text-gray-400 font-medium">
              No checklist items available yet.
            </Text>
            <Text variant="text-s" className="text-gray-300 mt-2">
              Your personalized migration tasks will appear here soon.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
