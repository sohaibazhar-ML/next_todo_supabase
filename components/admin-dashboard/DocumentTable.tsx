/**
 * Document Table Component
 * 
 * Reusable component for displaying documents in a table format.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { formatFileSize } from '@/lib/utils/file-utils'
import { formatDate } from '@/lib/utils/date-utils'
import { IconSpinner } from '@/components/ui/icons'

export interface DocumentTableProps {
  documents: Document[]
  isLoading?: boolean
}

export default function DocumentTable({
  documents,
  isLoading = false,
}: DocumentTableProps) {
  const t = useTranslations('adminDocuments')

  if (documents.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
          {t('noDocuments')}
        </td>
      </tr>
    )
  }

  return (
    <>
      {documents.map((doc: Document) => (
        <tr key={doc.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {doc.title}
            </div>
            {doc.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {doc.description}
              </div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {doc.category}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {doc.file_type}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatFileSize(doc.file_size)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {doc.download_count || 0}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDate(doc.created_at)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                doc.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {doc.is_active ? t('table.active') : t('table.inactive')}
            </span>
          </td>
        </tr>
      ))}
      {isLoading && documents.length > 0 && (
        <tr>
          <td colSpan={7} className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-center items-center">
              <IconSpinner className="h-5 w-5 text-indigo-600" />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

