/**
 * Document Management Container
 * 
 * Container component that handles all state and data fetching for document management.
 * Delegates UI rendering to DocumentManagementView.
 * 
 * Responsibilities:
 * - Data fetching with React Query
 * - State management (editing, expanded versions)
 * - Business logic (delete, toggle featured, etc.)
 * - Supabase storage operations
 */

'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDocuments, useDeleteDocument, useUpdateDocument } from '@/hooks/api/useDocuments'
import { useModal } from '@/hooks'
import type { Document } from '@/types/document'
import { ERROR_MESSAGES, CONSOLE_MESSAGES, ROUTES, STORAGE_BUCKETS } from '@/constants'
import DocumentManagementView from './DocumentManagementView'

export default function DocumentManagementContainer() {
  const supabase = createClient()
  
  // Use custom hook for modal state
  const editModal = useModal<Document>()
  
  // Track expanded version sections
  const [expandedVersions, setExpandedVersions] = React.useState<Set<string>>(new Set())

  // React Query hooks for data fetching
  const { data: documents = [], isLoading, error } = useDocuments()
  const deleteMutation = useDeleteDocument()
  const updateMutation = useUpdateDocument()

  /**
   * Delete a document from both storage and database
   */
  const handleDelete = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage using centralized bucket configuration
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
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
      alert(errorMessage)
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
      alert(errorMessage)
    }
  }

  /**
   * Toggle version history visibility for a document
   */
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

  /**
   * Navigate to upload page for new version
   */
  const handleUploadNewVersion = (documentId: string) => {
    const locale = window.location.pathname.split('/')[1] || 'en'
    window.location.href = ROUTES.ADMIN_DOCUMENTS(locale, documentId)
  }

  return (
    <DocumentManagementView
      documents={documents}
      isLoading={isLoading}
      error={error}
      editModal={editModal}
      expandedVersions={expandedVersions}
      onDelete={handleDelete}
      onToggleFeatured={handleToggleFeatured}
      onToggleVersions={toggleVersions}
      onUploadNewVersion={handleUploadNewVersion}
    />
  )
}
