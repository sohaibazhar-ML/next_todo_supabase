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

import { useEffect, useMemo } from 'react'
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

  // Memoize initial values to prevent infinite loops
  const initialValues = useMemo(() => {
    if (defaultValues) {
      return defaultValues
    }
    if (document) {
      return {
        title: document.title,
        description: document.description || '',
        category: document.category,
        tags: document.tags || [],
        is_featured: document.is_featured || false,
      }
    }
    return undefined
  }, [
    defaultValues,
    document?.id,
    document?.title,
    document?.description,
    document?.category,
    document?.tags,
    document?.is_featured,
  ])

  const { form, onSubmit, isLoading, error, isSuccess } = useDocumentEditForm({
    documentId,
    onSuccess,
    defaultValues: initialValues,
  })

  // Reset form when document changes (using memoized initialValues)
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues)
    }
    // form.reset is stable from react-hook-form, so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

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

