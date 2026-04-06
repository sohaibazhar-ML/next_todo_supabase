"use client";

import React from 'react';
import { DocumentRow } from '@/website/molecules';
import { DashboardPagination } from '@/website/molecules';
import { DocumentListProps } from '@/website/organisms/DocumentList/DocumentList.types';
import { usePagination } from '@/app/_hooks/website/usePagination';

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  className = '' 
}) => {
  const { currentPage, totalPages, currentData, onPageChange, startIndex } = usePagination({
    data: documents,
    itemsPerPage: 20
  });

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Top Pagination */}
      <DashboardPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* List Container */}
      <div className="w-full flex flex-col">
        {currentData.map((doc: any, idx: number) => (
          <DocumentRow 
            key={doc.id}
            document={doc}
            index={startIndex + idx}
          />
        ))}
        
        {/* Fill empty rows if needed to maintain height (optional) */}
        {currentData.length < 20 && currentData.length > 0 && (
          Array.from({ length: 20 - currentData.length }).map((_, i) => (
            <div key={`empty-${i}`} className={`h-[52px] ${(currentData.length + i) % 2 !== 0 ? 'bg-background-neutral/30' : 'bg-white'}`} />
          ))
        )}
      </div>

      {/* Bottom Pagination */}
      <DashboardPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
