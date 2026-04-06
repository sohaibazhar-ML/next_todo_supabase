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
        className="text-secondary/60 hover:text-secondary p-0 h-auto font-normal"
      >
        {t('prev')}
      </Button>

      {/* Pages */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {pages.map((page) => (
          <Button
            key={page}
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page)}
            className={`transition-all flex items-center justify-center h-6 min-w-[20px] rounded-none p-0 ${currentPage === page
              ? 'text-secondary border-b-2 border-secondary font-bold'
              : 'text-secondary/60 hover:text-secondary'
              }`}
          >
            {page}
          </Button>
        ))}
      </div>

      {/* Next */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-secondary/60 hover:text-secondary p-0 h-auto font-normal"
      >
        {t('next')}
      </Button>
    </div>
  );
};
