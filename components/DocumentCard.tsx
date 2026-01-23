/**
 * Document Card Component
 * 
 * Displays a document card with metadata, version management, and download functionality.
 * 
 * Features:
 * - Document metadata display
 * - Version selection and management
 * - Download functionality with logging
 * - Edit button for editable document types
 * 
 * This component has been refactored to:
 * - Use constants from @/constants
 * - Remove all 'any' types
 * - Use proper TypeScript types
 * - Extract sub-components for better organization
 * - Use custom hooks for download functionality
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { ROUTES } from '@/constants/routes'
import { useDocumentVersions } from '@/hooks/api/useDocuments'
import { useDownloadLogs } from '@/hooks/api/useDownloadLogs'
import { useDocumentDownload } from '@/hooks/useDocumentDownload'
import DocumentHeader from './document-card/DocumentHeader'
import DocumentTags from './document-card/DocumentTags'
import DocumentMetadata from './document-card/DocumentMetadata'
import DocumentVersionSelector from './document-card/DocumentVersionSelector'
import DocumentActions from './document-card/DocumentActions'
import { ErrorMessage } from '@/components/ui'

interface DocumentCardProps {
  document: Document
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const t = useTranslations('documentCard')
  const router = useRouter()
  const [showVersions, setShowVersions] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Document | null>(document)

  // Use custom hook for download functionality
  const { downloading, error, downloadDocument: downloadDocumentFn } = useDocumentDownload()

  // Use React Query hooks for data fetching
  const { data: versions = [], isLoading: loadingVersions } = useDocumentVersions(
    showVersions ? document.id : null
  )
  const { data: downloadLogs = [] } = useDownloadLogs({ documentId: document.id })
  
  const versionCount = versions.length
  const actualDownloadCount = downloadLogs.length

  // Update selected version when versions are loaded
  useEffect(() => {
    if (versions.length > 0 && showVersions) {
      const currentVersion = versions.find((v: Document) => v.id === document.id) || document
      setSelectedVersion(currentVersion)
    }
  }, [versions, showVersions, document])

  // Check if document can be edited (PDF or DOCX/DOC files)
  // Database stores: 'pdf' for PDFs, 'document' for DOCX/DOC files
  // TypeScript type uses: 'PDF' for PDFs, 'DOCX' for DOCX/DOC files
  const fileTypeLower = document.file_type?.toLowerCase() || ''
  const canEdit = fileTypeLower === 'pdf' || fileTypeLower === 'document' || 
                  document.file_type === 'PDF' || document.file_type === 'DOCX'

  const handleEdit = () => {
    const locale = window.location.pathname.split('/')[1]
    router.push(ROUTES.DOCUMENTS_EDIT(locale, document.id))
  }

  const toggleVersions = () => {
    setShowVersions(prev => !prev)
  }

  const handleDownload = async () => {
    const targetDoc = selectedVersion || document
    await downloadDocumentFn(targetDoc, document)
  }

  const handleVersionChange = (version: Document) => {
    setSelectedVersion(version)
  }

  const totalDownloads = showVersions && versions.length > 1
    ? versions.reduce((sum, v) => sum + (v.download_count || 0), 0)
    : undefined

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <DocumentHeader document={document} />

        {document.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
        )}

        <DocumentTags tags={document.tags || []} />

        <DocumentMetadata
          document={document}
          versionCount={versionCount}
          actualDownloadCount={actualDownloadCount}
          showVersions={showVersions}
          totalDownloads={totalDownloads}
        />

        {showVersions && (
          <DocumentVersionSelector
            versions={versions}
            selectedVersion={selectedVersion}
            currentDocumentId={document.id}
            onVersionChange={handleVersionChange}
          />
        )}

        {error && <ErrorMessage message={error} />}

        <DocumentActions
          canEdit={canEdit}
          downloading={downloading}
          loadingVersions={loadingVersions}
          showVersions={showVersions}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onToggleVersions={toggleVersions}
        />
      </div>
    </div>
  )
}
