/**
 * Document Edit Form Component
 * 
 * Main form component for editing document metadata.
 * Uses React Hook Form with Zod validation and React Query for data fetching.
 * 
 * @example
 * ```tsx
 * <DocumentEditForm
 *   documentId="123"
 *   defaultValues={{
 *     title: "Document Title",
 *     category: "Immigration"
 *   }}
 *   onSuccess={() => console.log('Updated!')}
 * />
 * ```
 */

'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useDocumentEditForm } from './useDocumentEditForm'
import DocumentEditFields from './DocumentEditFields'
import { ErrorMessage, SuccessMessage } from '@/components/ui'
import type { Document } from '@/types'

export interface DocumentEditFormProps {
  /**
   * Document ID to edit
   */
  documentId: string
  
  /**
   * Document data (for pre-filling form)
   */
  document?: Document | null
  
  /**
   * Callback when update succeeds
   */
  onSuccess?: () => void
  
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
  
  /**
   * Initial form values (overrides document data if provided)
   */
  defaultValues?: Partial<{
    title: string
    description: string
    category: string
    tags: string[]
    is_featured: boolean
  }>
}

export default function DocumentEditForm({
  documentId,
  document,
  onSuccess,
  onCancel,
  defaultValues,
}: DocumentEditFormProps) {
  const t = useTranslations('documentEditModal')

  // Use document data or defaultValues for initial form values
  const initialValues = defaultValues || (document
    ? {
        title: document.title,
        description: document.description || '',
        category: document.category,
        tags: document.tags || [],
        is_featured: document.is_featured || false,
      }
    : undefined)

  const { form, onSubmit, isLoading, error, isSuccess } = useDocumentEditForm({
    documentId,
    onSuccess,
    defaultValues: initialValues,
  })

  // Reset form when document changes
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues)
    }
  }, [document?.id, form, initialValues])

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
              : t('updateFailed') || 'Update failed'
          }
        />
      )}

      {/* Success Message */}
      {isSuccess && (
        <SuccessMessage
          message={t('updateSuccess') || 'Document updated successfully'}
        />
      )}

      {/* Form Fields */}
      <DocumentEditFields
        form={form}
        isLoading={isLoading}
        version={document?.version}
        onCancel={onCancel}
      />
    </form>
  )
}

