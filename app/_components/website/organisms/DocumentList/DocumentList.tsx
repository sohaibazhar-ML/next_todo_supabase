"use client";

import React, { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { DocumentTable, DashboardPagination } from '@/website/molecules';
import { DocumentListProps } from '@/website/organisms/DocumentList/DocumentList.types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DocumentItem } from '@/website/types';

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents,
  totalPages,
  currentPage,
  sortField,
  sortOrder,
  className = '' 
}) => {
  const t = useTranslations('Dashboard.list');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get('sort');
    const currentOrder = params.get('order');

    if (currentSort === field) {
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort', field);
      params.set('order', 'asc');
    }
    params.set('page', '1'); // Reset to first page on sort change
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleDownload = async (doc: DocumentItem) => {
    if (downloadingId) return;
    setDownloadingId(doc.id);
    try {
      const response = await fetch(`/api/website/documents/${doc.id}/download-url`);
      const data = await response.json();
      
      if (data.signedUrl) {
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.setAttribute('download', doc.name);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Top Pagination */}
      <div className="flex justify-center mb-2">
        <DashboardPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="py-0"
        />
      </div>

      {/* Document Table */}
      <DocumentTable 
        documents={documents} 
        emptyMessage={t('emptyState')}
        onDownloadClick={handleDownload}
        onSortChange={handleSortChange}
        sortField={sortField}
        sortOrder={sortOrder}
        downloadingId={downloadingId}
        isLoading={isPending}
      />

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
