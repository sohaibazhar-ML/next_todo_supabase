"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Text, Image, Button } from '@/website/atoms';
import { DocumentItem } from '@/website/types';
import { FileText, Trash2, Download, Loader2 } from 'lucide-react';

interface DocumentTableProps {
  documents: DocumentItem[];
  emptyMessage?: string;
  onUploadClick?: () => void;
  onDeleteClick?: (doc: DocumentItem) => void;
  onDownloadClick?: (doc: DocumentItem) => void;
  onSortChange?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  downloadingId?: string | null;
  isLoading?: boolean;
  variant?: 'all' | 'user';
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ 
  documents, 
  emptyMessage,
  onUploadClick,
  onDeleteClick,
  onDownloadClick,
  onSortChange,
  sortField,
  sortOrder = 'asc',
  downloadingId,
  isLoading,
  variant = 'all'
}) => {
  const t = useTranslations('Dashboard.list');
  const getFileIcon = (type: string) => {
    if (type === 'pdf') return '/assets/website/dashboard/pdf.png';
    if (type === 'doc') return '/assets/website/dashboard/word.png';
    if (type === 'xls') return '/assets/website/dashboard/excell.png';
    if (type === 'zip') return '/assets/website/dashboard/zip.png';
    return '/assets/website/dashboard/pdf.png'; // Fallback
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded shadow-sm overflow-hidden border border-gray-200 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Text variant="text-xxs" className="text-secondary/60 font-bold uppercase tracking-widest">{t('loading') || 'Sorting...'}</Text>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#414141] text-white">
              {variant === 'all' ? (
                <>
                  <th 
                    className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[15%] cursor-pointer hover:bg-[#555555] transition-colors group"
                    onClick={() => onSortChange?.('category')}
                  >
                    <div className="flex items-center gap-1">
                      {t('columns.category')}
                      <span className={`text-[10px] transition-opacity ${sortField === 'category' ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}>
                        {sortField === 'category' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[45%] cursor-pointer hover:bg-[#555555] transition-colors group"
                    onClick={() => onSortChange?.('title')}
                  >
                    <div className="flex items-center gap-1">
                      {t('columns.name')}
                      <span className={`text-[10px] transition-opacity ${sortField === 'title' ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}>
                        {sortField === 'title' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[30%] cursor-pointer hover:bg-[#555555] transition-colors group"
                    onClick={() => onSortChange?.('recipient')}
                  >
                    <div className="flex items-center gap-1">
                      {t('columns.recipient')}
                      <span className={`text-[10px] transition-opacity ${sortField === 'recipient' ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}>
                        {sortField === 'recipient' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm w-[10%] text-center">
                    {t('columns.file')}
                  </th>
                </>
              ) : (
                <>
                  <th 
                    className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[55%] cursor-pointer hover:bg-[#555555] transition-colors group"
                    onClick={() => onSortChange?.('title')}
                  >
                    <div className="flex items-center gap-1">
                      {t('columns.name')}
                      <span className={`text-[10px] transition-opacity ${sortField === 'title' ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}>
                        {sortField === 'title' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[20%] cursor-pointer hover:bg-[#555555] transition-colors group"
                    onClick={() => onSortChange?.('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      {t('columns.date')}
                      <span className={`text-[10px] transition-opacity ${sortField === 'created_at' ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}>
                        {sortField === 'created_at' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[15%] text-center">
                    {t('columns.download')}
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm w-[10%] text-center">
                    {t('columns.delete')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                onClick={() => {
                  if (variant === 'all') onDownloadClick?.(doc);
                }}
                className={`hover:bg-gray-50/50 transition-colors ${variant === 'all' ? 'cursor-pointer' : ''}`}
              >
                {variant === 'all' ? (
                  <>
                    <td className="py-3.5 px-4 text-sm text-secondary/80 border-r border-gray-100">
                      {doc.category || 'Info'}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-secondary font-medium border-r border-gray-100">
                      {doc.name}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-secondary/80 border-r border-gray-100">
                      {doc.recipient || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center transition-transform hover:scale-110">
                        {downloadingId === doc.id ? (
                          <Loader2 size={24} className="animate-spin text-primary" />
                        ) : (
                          <Image 
                            src={getFileIcon(doc.type)} 
                            alt="file icon" 
                            width={24} 
                            height={24}
                            className="object-contain"
                          />
                        )}
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3.5 px-4 text-sm text-secondary font-medium border-r border-gray-100">
                      {doc.name}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-secondary/80 border-r border-gray-100">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center border-r border-gray-100">
                      <Button 
                        variant="unstyled"
                        onClick={() => onDownloadClick?.(doc)}
                        disabled={!!downloadingId}
                        className="inline-flex items-center justify-center transition-transform hover:scale-110 text-secondary disabled:opacity-50"
                        title={t('columns.download')}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 size={20} className="animate-spin text-primary" />
                        ) : (
                          <Download size={20} />
                        )}
                      </Button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button 
                        variant="unstyled"
                        onClick={() => onDeleteClick?.(doc)}
                        className="inline-flex items-center justify-center transition-transform hover:scale-110 text-primary font-bold text-xl"
                        title={t('columns.delete')}
                      >
                        X
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {/* Empty State */}
            {documents.length === 0 && (
              <tr>
                <td colSpan={variant === 'all' ? 4 : 4} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/5 flex items-center justify-center mb-4">
                      <FileText size={28} className="text-secondary/30" />
                    </div>
                    <Text variant="text-s" className="text-secondary/50 font-medium mb-1">
                      {emptyMessage || t('emptyState')}
                    </Text>
                    {onUploadClick && (
                      <Button 
                        variant="link"
                        onClick={onUploadClick}
                        className="text-sm font-semibold mt-2"
                      >
                        {t('emptyStateAction')}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};
