/**
 * Subadmin Form Fields Component
 * 
 * Reusable form fields component for subadmin form.
 * Uses react-hook-form for form state management.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateSubadminFormData, UpdateSubadminFormData } from './subadminFormSchema'
import { Select, Checkbox, Button } from '@/components/ui'
import type { UserProfile } from '@/types/user'
import type { Subadmin } from '@/services/api/subadmins'

export interface SubadminFormFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<CreateSubadminFormData | UpdateSubadminFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Available users (for selection when creating)
   */
  availableUsers?: UserProfile[]
  
  /**
   * Existing subadmins (to filter out from available users)
   */
  existingSubadmins?: Subadmin[]
  
  /**
   * Whether form is in edit mode
   */
  isEditing?: boolean
  
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
}

export default function SubadminFormFields({
  form,
  isLoading = false,
  availableUsers = [],
  existingSubadmins = [],
  isEditing = false,
  onCancel,
}: SubadminFormFieldsProps) {
  const t = useTranslations('subadmin')
  
  const {
    register,
    formState: { errors },
  } = form

  // Filter out users who are already subadmins
  const selectableUsers = availableUsers.filter(
    user => !existingSubadmins.some(subadmin => subadmin.id === user.id)
  )

  return (
    <div className="space-y-4">
      {/* User Selection (only for creation) */}
      {!isEditing && (
        <Select
          {...register('userId')}
          label={t('selectUser')}
          error={errors.userId?.message}
          disabled={isLoading}
          required
        >
          <option value="" disabled className="text-gray-500">
            {t('selectUserPlaceholder')}
          </option>
          {selectableUsers.map((user) => (
            <option key={user.id} value={user.id} className="text-gray-900">
              {user.first_name} {user.last_name} ({user.email})
            </option>
          ))}
        </Select>
      )}

      {/* Permissions */}
      <div className="space-y-3">
        <Checkbox
          {...register('can_upload_documents')}
          label={t('canUploadDocuments')}
          disabled={isLoading}
        />

        <Checkbox
          {...register('can_view_stats')}
          label={t('canViewStats')}
          disabled={isLoading}
        />

        <Checkbox
          {...register('is_active')}
          label={t('isActive')}
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading
            ? isEditing
              ? t('updating')
              : t('creating')
            : isEditing
            ? t('update')
            : t('create')}
        </Button>
      </div>
    </div>
  )
}

