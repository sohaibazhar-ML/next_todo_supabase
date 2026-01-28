/**
 * Subadmin Management View
 * 
 * Presentational component that renders the subadmin management UI.
 * Receives all data and handlers as props from the container.
 * 
 * Responsibilities:
 * - Render loading and error states
 * - Render subadmin form
 * - Render subadmin list table
 * - Render success/error messages
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Subadmin } from '@/services/api/subadmins'
import type { UserProfile } from '@/types/user'
import type { SubadminActionType } from '@/hooks/useSubadminActions'
import { IconSpinner } from '@/components/ui/icons'
import { SuccessMessage, ErrorMessage } from '@/components/ui'
import { Button } from '@/components/ui'
import { SubadminForm } from '@/components/forms/SubadminForm'
import SubadminListTable from './SubadminListTable'

interface SubadminManagementViewProps {
  subadmins: Subadmin[]
  users: UserProfile[]
  isLoading: boolean
  error: Error | null
  mutationError: Error | null
  message: string | null
  showForm: boolean
  editingSubadmin: Subadmin | null
  isActionLoading: (subadminId: string, action: SubadminActionType) => boolean
  onFormSuccess: () => void
  onFormCancel: () => void
  onEdit: (subadmin: Subadmin) => void
  onDelete: (userId: string) => Promise<void>
  onToggleActive: (subadmin: Subadmin) => Promise<void>
  onToggleForm: () => void
}

export default function SubadminManagementView({
  subadmins,
  users,
  isLoading,
  error,
  mutationError,
  message,
  showForm,
  editingSubadmin,
  isActionLoading,
  onFormSuccess,
  onFormCancel,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleForm,
}: SubadminManagementViewProps) {
  const t = useTranslations('subadmin')

  // Loading state
  if (isLoading && subadmins.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Messages */}
      {(error || mutationError) && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : mutationError instanceof Error
              ? mutationError.message
              : 'An error occurred'
          }
        />
      )}

      {/* Success Message */}
      {message && (
        <SuccessMessage message={message} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <Button
          variant="primary"
          onClick={onToggleForm}
        >
          {showForm ? t('cancel') : t('addSubadmin')}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSubadmin ? t('editSubadmin') : t('addSubadmin')}
          </h3>
          <SubadminForm
            editingSubadmin={editingSubadmin}
            availableUsers={users}
            existingSubadmins={subadmins}
            onSuccess={onFormSuccess}
            onCancel={onFormCancel}
          />
        </div>
      )}

      {/* Subadmin List */}
      <SubadminListTable
        subadmins={subadmins}
        isActionLoading={isActionLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />
    </div>
  )
}
