/**
 * Document Metadata Component
 * 
 * Displays document metadata information (category, file type, version, size, downloads).
 */

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { DEFAULT_VALUES } from '@/constants'
import { formatFileSize } from '@/lib/utils/file-utils'

interface DocumentMetadataProps {
  document: Document
  versionCount: number
  actualDownloadCount: number
  showVersions?: boolean
  totalDownloads?: number
}

export default function DocumentMetadata({
  document,
  versionCount,
  actualDownloadCount,
  showVersions = false,
  totalDownloads,
}: DocumentMetadataProps) {
  const t = useTranslations('documentCard')

  return (
    <div className="space-y-2 mb-4 text-sm text-gray-500">
      <div className="flex items-center justify-between">
        <span>{t('category')}:</span>
        <span className="font-medium text-gray-900">{document.category}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t('fileType')}:</span>
        <span className="font-medium text-gray-900">{document.file_type}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t('version')}:</span>
        <span className="font-medium text-gray-900">
          {document.version || DEFAULT_VALUES.DEFAULT_VERSION}
        </span>
      </div>
      {versionCount !== null && versionCount > 1 && (
        <div className="flex items-center justify-between">
          <span>{t('availableVersions')}:</span>
          <span className="font-medium text-indigo-600">{versionCount} {t('versions')}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span>{t('size')}:</span>
        <span className="font-medium text-gray-900">{formatFileSize(document.file_size)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t('downloadsThisVersion')}:</span>
        <span className="font-medium text-gray-900">
          {actualDownloadCount !== null ? actualDownloadCount : (document.download_count || 0)}
        </span>
      </div>
      {showVersions && totalDownloads !== undefined && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span>{t('totalDownloads')}:</span>
          <span className="font-medium text-indigo-600">{totalDownloads}</span>
        </div>
      )}
    </div>
  )
}

