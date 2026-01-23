/**
 * Subadmin Form Hook
 * 
 * Custom hook for managing subadmin form state and submission.
 * Uses React Hook Form with Zod validation and React Query mutations.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateSubadmin, useUpdateSubadmin } from '@/hooks/api/useSubadmins'
import {
  createSubadminSchema,
  updateSubadminSchema,
  type CreateSubadminFormData,
  type UpdateSubadminFormData,
} from './subadminFormSchema'
import type { Subadmin } from '@/services/api/subadmins'

export interface UseSubadminFormOptions {
  /**
   * Subadmin being edited (null for creation)
   */
  editingSubadmin: Subadmin | null
  
  /**
   * Callback when form submission succeeds
   */
  onSuccess?: () => void
}

export interface UseSubadminFormReturn {
  /**
   * React Hook Form instance
   */
  form: ReturnType<typeof useForm<CreateSubadminFormData | UpdateSubadminFormData>>
  
  /**
   * Form submission handler
   */
  onSubmit: (data: CreateSubadminFormData | UpdateSubadminFormData) => Promise<void>
  
  /**
   * Whether form is in loading state
   */
  isLoading: boolean
  
  /**
   * Error message if submission fails
   */
  error: Error | null
}

/**
 * Hook for managing subadmin form
 */
export function useSubadminForm({
  editingSubadmin,
  onSuccess,
}: UseSubadminFormOptions): UseSubadminFormReturn {
  const queryClient = useQueryClient()
  const isEditing = editingSubadmin !== null

  // Use appropriate schema based on create/edit mode
  const schema = isEditing ? updateSubadminSchema : createSubadminSchema

  const form = useForm<CreateSubadminFormData | UpdateSubadminFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          can_upload_documents: editingSubadmin.permissions.can_upload_documents,
          can_view_stats: editingSubadmin.permissions.can_view_stats,
          is_active: editingSubadmin.permissions.is_active,
        }
      : {
          userId: '',
          can_upload_documents: false,
          can_view_stats: false,
          is_active: true,
        },
    mode: 'onChange',
  })

  // Mutations
  const createMutation = useCreateSubadmin()
  const updateMutation = useUpdateSubadmin()

  const onSubmit = async (data: CreateSubadminFormData | UpdateSubadminFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          userId: editingSubadmin.id,
          updates: data as UpdateSubadminFormData,
        })
      } else {
        await createMutation.mutateAsync(data as CreateSubadminFormData)
      }

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ['subadmins'] })
      await queryClient.invalidateQueries({ queryKey: ['users'] })

      // Reset form
      form.reset()

      onSuccess?.()
    } catch (err) {
      // Error is handled by mutation error state
      throw err
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const error = (createMutation.error || updateMutation.error) as Error | null

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    error,
  }
}

