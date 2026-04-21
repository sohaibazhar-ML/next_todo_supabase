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
  downloadingId?: string | null;
  variant?: 'all' | 'user';
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ 
  documents, 
  emptyMessage,
  onUploadClick,
  onDeleteClick,
  onDownloadClick,
  downloadingId,
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
      <div className="w-full max-w-6xl bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#414141] text-white">
              {variant === 'all' ? (
                <>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[15%]">
                    {t('columns.category')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[45%]">
                    {t('columns.name')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[30%]">
                    {t('columns.recipient')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm w-[10%] text-center">
                    {t('columns.file')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[55%]">
                    {t('columns.name')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[20%]">
                    {t('columns.date')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm border-r border-white/10 w-[15%] text-center">
                    {t('columns.download')} <span className="ml-1 text-[10px]">▲</span>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-sm w-[10%] text-center">
                    {t('columns.delete')} <span className="ml-1 text-[10px]">▲</span>
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
