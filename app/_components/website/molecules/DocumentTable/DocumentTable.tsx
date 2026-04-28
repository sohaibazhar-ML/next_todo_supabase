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
      <div className="w-full max-w-6xl relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Text variant="text-xxs" className="text-secondary/60 font-bold uppercase tracking-widest">{t('loading') || 'Sorting...'}</Text>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-[4px]">
          <thead>
            <tr className="text-white">
              {variant === 'all' ? (
                <>
                  <th 
                    className="py-[12px] px-4 text-left w-[18%] cursor-pointer bg-[#333333] hover:bg-[#444444] transition-colors group first:rounded-tl-sm relative"
                    onClick={() => onSortChange?.('category')}
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.category')}</Text>
                      <span className={`text-[12px] transition-opacity ${sortField === 'category' ? 'opacity-100' : 'opacity-40'}`}>
                        {sortField === 'category' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th 
                    className="py-[12px] px-4 text-left w-[42%] cursor-pointer bg-[#333333] hover:bg-[#444444] transition-colors group relative"
                    onClick={() => onSortChange?.('title')}
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.name')}</Text>
                      <span className={`text-[12px] transition-opacity ${sortField === 'title' ? 'opacity-100' : 'opacity-40'}`}>
                        {sortField === 'title' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th 
                    className="py-[12px] px-4 text-left w-[30%] cursor-pointer bg-[#333333] hover:bg-[#444444] transition-colors group relative"
                    onClick={() => onSortChange?.('recipient')}
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.recipient')}</Text>
                      <span className={`text-[12px] transition-opacity ${sortField === 'recipient' ? 'opacity-100' : 'opacity-40'}`}>
                        {sortField === 'recipient' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th className="py-[12px] px-4 text-left w-[10%] bg-[#333333] last:rounded-tr-sm">
                    <Text variant="table-heading" className="text-white">{t('columns.file')}</Text>
                  </th>
                </>
              ) : (
                <>
                  <th 
                    className="py-[12px] px-4 text-left w-[55%] cursor-pointer bg-[#333333] hover:bg-[#444444] transition-colors group first:rounded-tl-sm relative"
                    onClick={() => onSortChange?.('title')}
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.name')}</Text>
                      <span className={`text-[12px] transition-opacity ${sortField === 'title' ? 'opacity-100' : 'opacity-40'}`}>
                        {sortField === 'title' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th 
                    className="py-[12px] px-4 text-left w-[20%] cursor-pointer bg-[#333333] hover:bg-[#444444] transition-colors group relative"
                    onClick={() => onSortChange?.('created_at')}
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.date')}</Text>
                      <span className={`text-[12px] transition-opacity ${sortField === 'created_at' ? 'opacity-100' : 'opacity-40'}`}>
                        {sortField === 'created_at' && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th className="py-[12px] px-4 text-center bg-[#333333] relative">
                    <div className="flex items-center justify-between">
                      <Text variant="table-heading" className="text-white">{t('columns.download')}</Text>
                      <span className="text-[12px] opacity-40">▲</span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
                  </th>
                  <th className="py-[12px] px-4 text-center bg-[#333333] last:rounded-tr-sm">
                    <Text variant="table-heading" className="text-white">{t('columns.delete')}</Text>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                onClick={() => {
                  if (variant === 'all') onDownloadClick?.(doc);
                }}
                className={`group transition-colors ${variant === 'all' ? 'cursor-pointer' : ''}`}
              >
                {variant === 'all' ? (
                  <>
                    <td className="py-[6.5px] px-4 relative bg-white first:rounded-l-sm group-hover:bg-gray-50 transition-colors">
                      <Text variant="table-data">{doc.category || 'Info'}</Text>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors">
                      <Text variant="table-data">{doc.name}</Text>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors">
                      <Text variant="table-data">{doc.recipient || '-'}</Text>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 text-center bg-white last:rounded-r-sm group-hover:bg-gray-50 transition-colors">
                      <div className="inline-flex items-center justify-center transition-transform hover:scale-105">
                        {downloadingId === doc.id ? (
                          <Loader2 size={24} className="animate-spin text-primary" />
                        ) : (
                          <Image 
                            src={getFileIcon(doc.type)} 
                            alt="file icon" 
                            width={23} 
                            height={28}
                            className="object-contain"
                          />
                        )}
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-[6.5px] px-4 relative bg-white first:rounded-l-sm group-hover:bg-gray-50 transition-colors">
                      <Text variant="table-data">{doc.name}</Text>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors">
                      <Text variant="table-data">{formatDate(doc.createdAt)}</Text>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 relative text-center bg-white group-hover:bg-gray-50 transition-colors">
                      <Button 
                        variant="unstyled"
                        onClick={() => onDownloadClick?.(doc)}
                        disabled={!!downloadingId}
                        className="inline-flex items-center justify-center transition-transform hover:scale-105 text-secondary disabled:opacity-50"
                        title={t('columns.download')}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 size={24} className="animate-spin text-primary" />
                        ) : (
                          <Download size={24} />
                        )}
                      </Button>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                    </td>
                    <td className="py-[6.5px] px-4 text-center bg-white last:rounded-r-sm group-hover:bg-gray-50 transition-colors">
                      <Button 
                        variant="unstyled"
                        onClick={() => onDeleteClick?.(doc)}
                        className="inline-flex items-center justify-center transition-transform hover:scale-110 text-primary font-bold text-2xl"
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
