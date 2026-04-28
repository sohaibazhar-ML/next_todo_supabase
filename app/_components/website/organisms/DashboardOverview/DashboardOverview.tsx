"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q')?.toLowerCase() || '';
  const [query, setQuery] = React.useState(initialQuery);
  const [isFiltering, setIsFiltering] = React.useState(false);

  // Synchronize with URL query on mount or back/forward navigation
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Listen for instant search events from the header
  React.useEffect(() => {
    const handleInstantSearch = (e: any) => {
      const val = e.detail?.toLowerCase() || '';
      setQuery(val);
      
      // Briefly show skeleton to indicate "processing" if desired, 
      // but keep it short for "instant" feel
      if (val) {
        setIsFiltering(true);
        const timer = setTimeout(() => setIsFiltering(false), 200);
        return () => clearTimeout(timer);
      } else {
        setIsFiltering(false);
      }
    };

    window.addEventListener('dashboard:search', handleInstantSearch);
    return () => window.removeEventListener('dashboard:search', handleInstantSearch);
  }, []);

  // Client-side filtering for fast, responsive search
  const filteredCards = checklistCards.filter(item => 
    item.title?.toLowerCase().includes(query) || 
    item.category?.toLowerCase().includes(query) ||
    (item.is_mandatory ? 'mandatory' : 'optional').includes(query)
  );

  const SkeletonCard = () => (
    <div className="bg-white p-6 shadow-sm border border-gray-50 flex flex-col gap-4 min-h-[160px] justify-between animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-6 w-full bg-gray-100 rounded" />
      </div>
      <div className="h-10 w-32 bg-gray-100 rounded" />
    </div>
  );

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
        {isFiltering ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
        ) : filteredCards.length > 0 ? (
          filteredCards.map((item, idx) => (
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
          null
        )}
      </div>

    </div>
  );
};
