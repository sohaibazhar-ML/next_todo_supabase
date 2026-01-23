/**
 * Document Version Selector Component
 * 
 * Displays and allows selection of document versions.
 */

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { DEFAULT_VALUES } from '@/constants'
import { formatFileSize } from '@/lib/utils/file-utils'

interface DocumentVersionSelectorProps {
  versions: Document[]
  selectedVersion: Document | null
  currentDocumentId: string
  onVersionChange: (version: Document) => void
}

export default function DocumentVersionSelector({
  versions,
  selectedVersion,
  currentDocumentId,
  onVersionChange,
}: DocumentVersionSelectorProps) {
  const t = useTranslations('documentCard')

  if (versions.length <= 1) {
    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 text-center">{t('noOtherVersions')}</p>
      </div>
    )
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">{t('selectVersion')}</label>
        <span className="text-xs text-gray-500">
          {t('versionsAvailable', { count: versions.length })}
        </span>
      </div>
      <select
        value={selectedVersion?.id || currentDocumentId}
        onChange={(e) => {
          const version = versions.find(v => v.id === e.target.value)
          if (version) {
            onVersionChange({ ...version, id: String(version.id) } as Document)
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 bg-white mb-3"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {t('version')} {version.version || DEFAULT_VALUES.DEFAULT_VERSION} -{' '}
            {new Date(version.created_at).toLocaleDateString()} (
            {formatFileSize(version.file_size)})
            {version.id === currentDocumentId ? ` (${t('current')})` : ''}
          </option>
        ))}
      </select>
      
      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
        <p className="text-xs font-medium text-gray-700 mb-2">{t('versionDetails')}</p>
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-2 rounded border text-xs ${
              version.id === currentDocumentId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">
                {t('version')} {version.version || DEFAULT_VALUES.DEFAULT_VERSION}
                {version.id === currentDocumentId && (
                  <span className="ml-1 text-indigo-600">({t('current')})</span>
                )}
              </span>
              <span className="text-gray-600">{version.download_count || 0} {t('downloads')}</span>
            </div>
            <div className="text-gray-500">
              {new Date(version.created_at).toLocaleDateString()} • {formatFileSize(version.file_size)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

