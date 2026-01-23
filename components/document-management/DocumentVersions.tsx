/**
 * Document Versions Component
 * 
 * Displays and manages document versions for a single document.
 * Used within DocumentManagement component.
 */

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { useDocumentVersions } from '@/hooks/api/useDocuments'
import { DEFAULT_VALUES } from '@/constants'
import { IconSpinner } from '@/components/ui/icons'

interface DocumentVersionsProps {
  documentId: string
  currentDocumentId: string
  onEdit: (doc: Document) => void
  onDelete: (id: string, filePath: string) => void
  isExpanded: boolean
}

export default function DocumentVersions({
  documentId,
  currentDocumentId,
  onEdit,
  onDelete,
  isExpanded,
}: DocumentVersionsProps) {
  const t = useTranslations('documentManagement')
  
  const { data: versions = [], isLoading: isLoadingVersions } = useDocumentVersions(
    isExpanded ? documentId : null
  )

  if (!isExpanded) return null

  if (isLoadingVersions) {
    return (
      <div className="mt-4 pl-8 border-l-2 border-indigo-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IconSpinner className="h-4 w-4" />
          {t('loadingVersions')}
        </div>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="mt-4 pl-8 border-l-2 border-indigo-200">
        <p className="text-sm text-gray-500">{t('noVersions')}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('versionHistory')}</h4>
      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-3 rounded-lg border ${
              version.id === currentDocumentId
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {t('version')} {version.version || 'N/A'}
                </span>
                {version.id === currentDocumentId && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                    {t('current')}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(version.created_at).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(version.file_size / 1024)} KB
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(version)}
                  className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium hover:bg-indigo-200 transition"
                  title="Edit this version (will update all versions)"
                >
                  {t('edit')}
                </button>
                {version.id !== currentDocumentId && (
                  <button
                    onClick={() => onDelete(version.id, version.file_path)}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition"
                  >
                    {t('deleteVersion')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

