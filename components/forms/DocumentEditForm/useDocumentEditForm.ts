/**
 * Document Edit Form Hook
 * 
 * Custom hook for managing document edit form state and submission.
 * Uses react-hook-form with Zod validation.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { documentEditSchema, type DocumentEditFormData } from './documentEditSchema'
import { updateDocument } from '@/services/api/documents'
import { documentKeys } from '@/hooks/api/useDocuments'
import { useQueryClient } from '@tanstack/react-query'

export interface UseDocumentEditFormOptions {
  /**
   * Document ID to update
   */
  documentId: string
  
  /**
   * Callback when update succeeds
   */
  onSuccess?: () => void
  
  /**
   * Initial form values (from existing document)
   */
  defaultValues?: Partial<DocumentEditFormData>
}

export function useDocumentEditForm({
  documentId,
  onSuccess,
  defaultValues,
}: UseDocumentEditFormOptions) {
  const queryClient = useQueryClient()

  const form = useForm<DocumentEditFormData>({
    resolver: zodResolver(documentEditSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      category: defaultValues?.category || '',
      tags: defaultValues?.tags || [],
      is_featured: defaultValues?.is_featured || false,
    },
    mode: 'onChange', // Validate on change for better UX
  })

  const updateMutation = useMutation({
    mutationFn: async (data: DocumentEditFormData) => {
      return updateDocument(documentId, {
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        tags: data.tags || undefined,
        is_featured: data.is_featured,
      })
    },
    onSuccess: (updatedDocument) => {
      // Update the specific document in cache
      queryClient.setQueryData(documentKeys.detail(documentId), updatedDocument)
      
      // Invalidate document lists to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      
      // Call success callback
      onSuccess?.()
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
  })

  return {
    form,
    onSubmit,
    isLoading: updateMutation.isPending,
    error: updateMutation.error,
    isSuccess: updateMutation.isSuccess,
  }
}

