/**
 * Document List Table
 * 
 * Renders the table/list of documents with all actions.
 * Pure presentational component with no business logic.
 * 
 * Responsibilities:
 * - Render document cards
 * - Render document metadata
 * - Render action buttons
 * - Render version history sections
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { DEFAULT_VALUES } from '@/constants'
import DocumentVersions from './DocumentVersions'

interface DocumentListTableProps {
  documents: Document[]
  expandedVersions: Set<string>
  onEdit: (document: Document) => void
  onDelete: (documentId: string, filePath: string) => Promise<void>
  onToggleFeatured: (document: Document) => Promise<void>
  onToggleVersions: (documentId: string) => void
  onUploadNewVersion: (documentId: string) => void
}

export default function DocumentListTable({
  documents,
  expandedVersions,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleVersions,
  onUploadNewVersion,
}: DocumentListTableProps) {
  const t = useTranslations('documentManagement')

  const handleDeleteClick = (documentId: string, filePath: string) => {
    if (confirm(t('confirmDelete'))) {
      onDelete(documentId, filePath)
    }
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-start justify-between">
            {/* Document Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                {document.is_featured && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {t('featured')}
                  </span>
                )}
              </div>

              {document.description && (
                <p className="text-sm text-gray-600 mb-2">{document.description}</p>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>{t('category')}: {document.category}</span>
                <span>{t('type')}: {document.file_type}</span>
                <span>
                  {t('version')}:{' '}
                  {document.version || DEFAULT_VALUES.DEFAULT_VERSION}
                </span>
                <span>{t('downloads')}: {document.download_count}</span>
                <span>{t('created')}: {new Date(document.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(document)}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-medium hover:bg-indigo-200 transition"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => onToggleVersions(document.id)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition"
              >
                {expandedVersions.has(document.id) ? (
                  t('hideVersions')
                ) : (
                  t('viewVersions')
                )}
              </button>
              <button
                onClick={() => onUploadNewVersion(document.id)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200 transition"
              >
                {t('uploadVersion')}
              </button>
              <button
                onClick={() => onToggleFeatured(document)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  document.is_featured
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {document.is_featured ? t('unfeature') : t('feature')}
              </button>
              <button
                onClick={() => handleDeleteClick(document.id, document.file_path)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition"
              >
                {t('delete')}
              </button>
            </div>
          </div>
          
          {/* Version History */}
          <DocumentVersions 
            documentId={document.id}
            currentDocumentId={document.id}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            isExpanded={expandedVersions.has(document.id)}
          />
        </div>
      ))}
    </div>
  )
}
