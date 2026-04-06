"use client";

import React from 'react';
import { DocumentRow, DashboardPagination } from '@/website/molecules';
import { Text } from '@/website/atoms';
import { DocumentListProps } from '@/website/organisms/DocumentList/DocumentList.types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents,
  totalPages,
  currentPage,
  className = '' 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const itemsPerPage = 20;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Top Pagination */}
      <DashboardPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* List Container */}
      <div className="w-full flex flex-col min-h-[400px]">
        {documents.map((doc: any, idx: number) => (
          <DocumentRow 
            key={doc.id}
            document={doc}
            index={startIndex + idx}
          />
        ))}
        
        {/* Empty State */}
        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-secondary/20">
            <Text variant="text-s" className="text-secondary/50 font-medium">
              No documents found
            </Text>
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <DashboardPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
