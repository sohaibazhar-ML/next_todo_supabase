"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Button } from '@/website/atoms';
import { DashboardPaginationProps } from '@/website/molecules/DashboardPagination/DashboardPagination.types';

export const DashboardPagination: React.FC<DashboardPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const t = useTranslations('Dashboard.list.pagination');

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 py-4 md:py-6 ${className}`}>
      {/* Prev */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-0 h-auto text-pagination-label lowercase"
      >
        {t('prev')}
      </Button>

      {/* Pages */}
      <div className="flex items-center gap-1.5 sm:gap-3 px-2 overflow-x-auto no-scrollbar">
        {pages.filter(page => {
          if (totalPages <= 5) return true;
          return page === 1 || 
                 page === totalPages || 
                 (page >= currentPage - 1 && page <= currentPage + 1);
        }).map((page, idx, filtered) => {
          const showEllipsisBefore = page > 1 && idx > 0 && page !== filtered[idx-1] + 1;
          
          return (
            <React.Fragment key={page}>
              {showEllipsisBefore && <span className="text-secondary/30">...</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page)}
                className={`transition-all flex items-center justify-center h-6 min-w-[20px] rounded-none p-0 ${currentPage === page
                  ? 'text-secondary border-b-2 border-secondary font-bold text-[24px]'
                  : 'text-secondary/60 hover:text-secondary text-[20px]'
                  }`}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Next */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-0 h-auto text-pagination-label lowercase"
      >
        {t('next')}
      </Button>
    </div>
  );
};
