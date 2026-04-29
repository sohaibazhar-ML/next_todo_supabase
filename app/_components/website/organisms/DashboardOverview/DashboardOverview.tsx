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

  // Synchronize with URL query on mount or back/forward navigation
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Listen for instant search events from the header
  React.useEffect(() => {
    const handleInstantSearch = (e: any) => {
      const val = e.detail?.toLowerCase() || '';
      setQuery(val);
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



  return (
    <div className="w-full flex flex-col gap-8">
      {/* Progress Bar Section */}
      <div className="flex flex-col gap-2">
        <Text variant="progress-label" className="text-secondary">
          {t('overview.progress', { percent: progressPercent })}
        </Text>
        <div 
          className="w-full h-[20px] flex overflow-hidden" 
          style={{ backgroundColor: '#999999' }}
        >
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.length > 0 ? (
          filteredCards.map((item, idx) => (
            <div key={item.id || idx} className="bg-white p-6 shadow-sm border border-gray-50 flex flex-col gap-4 min-h-[160px] justify-between transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-2">
                <Text variant="card-label" className="text-primary uppercase tracking-wider">
                  {item.is_mandatory ? t('overview.labels.mandatory') : t('overview.labels.optional')}
                </Text>
                <Text variant="card-title" className="text-secondary">
                  {item.title}
                </Text>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white w-fit !py-[8px] !px-[20px] !h-auto rounded-none text-card-button shadow-sm"
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
