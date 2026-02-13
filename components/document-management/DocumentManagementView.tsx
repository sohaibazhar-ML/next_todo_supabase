/**
 * Document Management View
 * 
 * Presentational component that renders the document management UI.
 * Receives all data and handlers as props from the container.
 * 
 * Responsibilities:
 * - Render loading and error states
 * - Render document list table
 * - Render edit modal
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import type { UseModalReturn } from '@/hooks'
import { ERROR_MESSAGES } from '@/constants'
import { IconSpinner } from '@/components/ui/icons'
import DocumentEditModal from '../DocumentEditModal'
import DocumentListTable from './DocumentListTable'

interface DocumentManagementViewProps {
  documents: Document[]
  isLoading: boolean
  error: Error | null
  editModal: UseModalReturn<Document>
  expandedVersions: Set<string>
  onDelete: (documentId: string, filePath: string) => Promise<void>
  onToggleFeatured: (document: Document) => Promise<void>
  onToggleVersions: (documentId: string) => void
  onUploadNewVersion: (documentId: string) => void
}

export default function DocumentManagementView({
  documents,
  isLoading,
  error,
  editModal,
  expandedVersions,
  onDelete,
  onToggleFeatured,
  onToggleVersions,
  onUploadNewVersion,
}: DocumentManagementViewProps) {
  const t = useTranslations('documentManagement')

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_DOCUMENTS_GENERIC}
        </p>
      </div>
    )
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('noDocuments')}</p>
      </div>
    )
  }

  return (
    <>
      {/* Edit Modal */}
      <DocumentEditModal
        document={editModal.data}
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        onSave={() => {
          editModal.close()
          // React Query will automatically refetch
        }}
      />

      {/* Document List */}
      <DocumentListTable
        documents={documents}
        expandedVersions={expandedVersions}
        onEdit={editModal.open}
        onDelete={onDelete}
        onToggleFeatured={onToggleFeatured}
        onToggleVersions={onToggleVersions}
        onUploadNewVersion={onUploadNewVersion}
      />
    </>
  )
}
