/**
 * Document Management Component
 * 
 * Admin component for managing documents including:
 * - Viewing all documents
 * - Editing document metadata
 * - Deleting documents
 * - Toggling featured status
 * - Managing document versions
 * 
 * This component has been refactored to:
 * - Use constants from @/constants
 * - Remove all 'any' types
 * - Use proper TypeScript types
 * - Improve error handling
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types/document'
import { ERROR_MESSAGES, CONSOLE_MESSAGES, DEFAULT_VALUES } from '@/constants'
import { useDocuments, useDeleteDocument, useUpdateDocument, useDocumentVersions } from '@/hooks/api/useDocuments'
import DocumentEditModal from './DocumentEditModal'

export default function DocumentManagement() {
  const t = useTranslations('documentManagement')
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const supabase = createClient() // Still needed for storage operations

  // Use React Query hooks for data fetching
  const { data: documents = [], isLoading, error } = useDocuments()
  const deleteMutation = useDeleteDocument()
  const updateMutation = useUpdateDocument()

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm(t('confirmDelete'))) {
      return
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (storageError) {
        console.error(CONSOLE_MESSAGES.ERROR_DELETING_FILE, storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database via mutation
      await deleteMutation.mutateAsync(documentId)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.DELETE_DOCUMENT
      console.error(CONSOLE_MESSAGES.DELETE_ERROR, err)
      alert(errorMessage) // Show error to user
    }
  }

  /**
   * Toggle featured status of a document
   */
  const handleToggleFeatured = async (document: Document) => {
    try {
      await updateMutation.mutateAsync({
        id: document.id,
        updates: {
          is_featured: !document.is_featured,
        },
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.UPDATE_DOCUMENT
      console.error(CONSOLE_MESSAGES.UPDATE_ERROR, err)
      alert(errorMessage) // Show error to user
    }
  }

  // Component to handle versions for a single document
  const DocumentVersions = ({ documentId, onEdit, onDelete }: { 
    documentId: string
    onEdit: (doc: Document) => void
    onDelete: (id: string, filePath: string) => void
  }) => {
    const { data: versions = [], isLoading: isLoadingVersions } = useDocumentVersions(
      expandedVersions.has(documentId) ? documentId : null
    )

    if (!expandedVersions.has(documentId)) return null

    if (isLoadingVersions) {
      return (
        <div className="mt-4 pl-8 border-l-2 border-indigo-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
                version.id === documentId
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {t('version')} {version.version || 'N/A'}
                  </span>
                  {version.id === documentId && (
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
                  {version.id !== documentId && (
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

  const toggleVersions = (documentId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(documentId)) {
        newSet.delete(documentId)
      } else {
        newSet.add(documentId)
      }
      return newSet
    })
  }

  const handleUploadNewVersion = (documentId: string) => {
    // Redirect to upload page with parent document ID
    window.location.href = `/admin/documents?uploadVersion=${documentId}`
  }

  const handleEditSave = () => {
    // React Query will automatically refetch when mutations invalidate the cache
    setEditingDoc(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to fetch documents'}
        </p>
      </div>
    )
  }

  return (
    <>
      <DocumentEditModal
        document={editingDoc}
        isOpen={editingDoc !== null}
        onClose={() => setEditingDoc(null)}
        onSave={handleEditSave}
      />
      <div className="space-y-4">
        {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('noDocuments')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
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
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingDoc(document)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-medium hover:bg-indigo-200 transition"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => toggleVersions(document.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition"
                  >
                    {expandedVersions.has(document.id) ? (
                      t('hideVersions')
                    ) : (
                      t('viewVersions')
                    )}
                  </button>
                  <button
                    onClick={() => handleUploadNewVersion(document.id)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200 transition"
                  >
                    {t('uploadVersion')}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(document)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      document.is_featured
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {document.is_featured ? t('unfeature') : t('feature')}
                  </button>
                  <button
                    onClick={() => handleDelete(document.id, document.file_path)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
              
              {/* Version History */}
              <DocumentVersions 
                documentId={document.id}
                onEdit={setEditingDoc}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  )
}

