/**
 * Subadmin Form Component
 * 
 * Main form component for creating/editing subadmins.
 * Uses React Hook Form with Zod validation and React Query for mutations.
 */

'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSubadminForm } from './useSubadminForm'
import SubadminFormFields from './SubadminFormFields'
import { ErrorMessage } from '@/components/ui'
import { UI_TEXT } from '@/constants'
import type { Subadmin } from '@/services/api/subadmins'
import type { UserProfile } from '@/types/user'

export interface SubadminFormProps {
  /**
   * Subadmin being edited (null for creation)
   */
  editingSubadmin: Subadmin | null
  
  /**
   * Available users (for selection when creating)
   */
  availableUsers?: UserProfile[]
  
  /**
   * Existing subadmins (to filter out from available users)
   */
  existingSubadmins?: Subadmin[]
  
  /**
   * Callback when form submission succeeds
   */
  onSuccess?: () => void
  
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
}

export default function SubadminForm({
  editingSubadmin,
  availableUsers = [],
  existingSubadmins = [],
  onSuccess,
  onCancel,
}: SubadminFormProps) {
  const t = useTranslations('subadmin')

  const { form, onSubmit, isLoading, error } = useSubadminForm({
    editingSubadmin,
    onSuccess,
  })

  // Reset form when editingSubadmin changes
  useEffect(() => {
    if (editingSubadmin) {
      form.reset({
        can_upload_documents: editingSubadmin.permissions.can_upload_documents,
        can_view_stats: editingSubadmin.permissions.can_view_stats,
        is_active: editingSubadmin.permissions.is_active,
      })
    } else {
      form.reset({
        userId: '',
        can_upload_documents: false,
        can_view_stats: false,
        is_active: true,
      })
    }
  }, [editingSubadmin?.id, form])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : t('saveFailed') || UI_TEXT.MESSAGES.SAVE_SUBADMIN_FAILED
          }
        />
      )}

      {/* Form Fields */}
      <SubadminFormFields
        form={form}
        isLoading={isLoading}
        availableUsers={availableUsers}
        existingSubadmins={existingSubadmins}
        isEditing={editingSubadmin !== null}
        onCancel={onCancel}
      />
    </form>
  )
}

