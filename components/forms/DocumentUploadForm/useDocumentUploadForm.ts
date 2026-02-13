/**
 * Document Upload Form Hook
 * 
 * Custom hook for managing document upload form state and submission.
 * Uses react-hook-form with Zod validation.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { documentUploadSchema, type DocumentUploadFormData } from './documentUploadSchema'
import { uploadDocument } from '@/services/api/documents'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useQueryClient } from '@tanstack/react-query'

export interface UseDocumentUploadFormOptions {
  /**
   * Callback when upload succeeds
   */
  onSuccess?: () => void
  
  /**
   * Parent document ID (for version uploads)
   */
  parentDocumentId?: string | null
  
  /**
   * Initial form values (for editing or pre-filling)
   */
  defaultValues?: Partial<DocumentUploadFormData>
}

export function useDocumentUploadForm({
  onSuccess,
  parentDocumentId,
  defaultValues,
}: UseDocumentUploadFormOptions = {}) {
  const t = useTranslations('documentUpload')
  const queryClient = useQueryClient()

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      category: defaultValues?.category || '',
      tags: defaultValues?.tags || [],
      is_featured: defaultValues?.is_featured || false,
      searchable_content: defaultValues?.searchable_content || '',
      parent_document_id: parentDocumentId || null,
      // file is not in defaultValues as it's a File object
    },
    mode: 'onChange', // Validate on change for better UX
  })

  const uploadMutation = useMutation({
    mutationFn: async (data: DocumentUploadFormData) => {
      return uploadDocument({
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        tags: data.tags || undefined,
        file: data.file,
        is_featured: data.is_featured,
        searchable_content: data.searchable_content || undefined,
      })
    },
    onSuccess: () => {
      // Invalidate document queries to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.filterOptions() })
      
      // Reset form
      form.reset()
      
      // Call success callback
      onSuccess?.()
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    uploadMutation.mutate(data)
  })

  return {
    form,
    onSubmit,
    isLoading: uploadMutation.isPending,
    error: uploadMutation.error,
    isSuccess: uploadMutation.isSuccess,
  }
}

