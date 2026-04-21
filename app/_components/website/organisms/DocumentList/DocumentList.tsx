"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DocumentTable, DashboardPagination } from '@/website/molecules';
import { DocumentListProps } from '@/website/organisms/DocumentList/DocumentList.types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DocumentItem } from '@/website/types';

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents,
  totalPages,
  currentPage,
  className = '' 
}) => {
  const t = useTranslations('Dashboard.list');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
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
        downloadingId={downloadingId}
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
