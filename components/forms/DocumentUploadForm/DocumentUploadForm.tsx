/**
 * Document Upload Form Component
 * 
 * Main form component for uploading documents or document versions.
 * Uses React Hook Form with Zod validation and React Query for data fetching.
 * 
 * @example
 * ```tsx
 * <DocumentUploadForm
 *   onSuccess={() => console.log('Uploaded!')}
 *   parentDocumentId="123"
 * />
 * ```
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useDocumentUploadForm } from './useDocumentUploadForm'
import DocumentUploadFields from './DocumentUploadFields'
import { ErrorMessage, SuccessMessage } from '@/components/ui'
import { useDocument } from '@/hooks/api/useDocuments'
import type { Document } from '@/types'

export interface DocumentUploadFormProps {
  /**
   * Callback when upload succeeds
   */
  onSuccess?: () => void
  
  /**
   * Parent document ID (for version uploads)
   */
  parentDocumentId?: string | null
  
  /**
   * Initial form values (for pre-filling)
   */
  defaultValues?: Partial<{
    title: string
    description: string
    category: string
    tags: string[]
    is_featured: boolean
  }>
}

export default function DocumentUploadForm({
  onSuccess,
  parentDocumentId: propParentDocumentId,
  defaultValues,
}: DocumentUploadFormProps) {
  const t = useTranslations('documentUpload')
  const searchParams = useSearchParams()
  
  // Check if this is a version upload from URL params
  const urlParentDocumentId = searchParams?.get('uploadVersion')
  const parentDocumentId = propParentDocumentId || urlParentDocumentId
  
  // Load parent document if uploading a version
  const { data: parentDocument, isLoading: loadingParent } = useDocument(
    parentDocumentId || null
  )

  const { form, onSubmit, isLoading, error, isSuccess } = useDocumentUploadForm({
    onSuccess,
    parentDocumentId: parentDocumentId || null,
    defaultValues: parentDocument
      ? {
          title: parentDocument.title,
          description: parentDocument.description || '',
          category: parentDocument.category,
          tags: parentDocument.tags || [],
          is_featured: parentDocument.is_featured || false,
        }
      : defaultValues,
  })

  // Show success message
  useEffect(() => {
    if (isSuccess && onSuccess) {
      // Success callback is handled in the hook
    }
  }, [isSuccess, onSuccess])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : t('uploadFailed') || 'Upload failed'
          }
        />
      )}

      {/* Success Message */}
      {isSuccess && (
        <SuccessMessage
          message={
            parentDocumentId
              ? t('versionUploadSuccess')
              : t('uploadSuccess')
          }
        />
      )}

      {/* Form Fields */}
      <DocumentUploadFields
        form={form}
        isLoading={isLoading}
        loadingParent={loadingParent}
        parentDocument={
          parentDocument
            ? {
                title: parentDocument.title,
                version: parentDocument.version,
              }
            : null
        }
      />
    </form>
  )
}

