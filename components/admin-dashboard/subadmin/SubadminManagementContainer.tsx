/**
 * Subadmin Management Container
 * 
 * Container component that handles all state and data fetching for subadmin management.
 * Delegates UI rendering to SubadminManagementView.
 * 
 * Responsibilities:
 * - Data fetching with React Query
 * - State management (form visibility, editing, messages)
 * - Business logic (delete, toggle active, etc.)
 * - Individual loading states for each action button
 */

'use client'

import React from 'react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSubadmins, useDeleteSubadmin, useUpdateSubadmin } from '@/hooks/api/useSubadmins'
import { useUsers } from '@/hooks/api/useUsers'
import { useModal } from '@/hooks'
import { useSubadminActions } from '@/hooks/useSubadminActions'
import type { Subadmin } from '@/services/api/subadmins'
import { ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/constants'
import SubadminManagementView from './SubadminManagementView'

export default function SubadminManagementContainer() {
  const t = useTranslations('subadmin')
  const [message, setMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  // Use custom hook for edit modal state
  const editModal = useModal<Subadmin>()
  
  // Use custom hook for individual action loading states
  const { isActionLoading, executeAction } = useSubadminActions()

  // React Query hooks for data fetching
  const { data: subadmins = [], isLoading, error } = useSubadmins()
  const { data: users = [] } = useUsers({ role: 'user' })
  
  // Mutations
  const deleteMutation = useDeleteSubadmin()
  const updateMutation = useUpdateSubadmin()

  /**
   * Handle successful form submission
   */
  const handleFormSuccess = () => {
    setMessage(t('updatedSuccessfully'))
    setShowForm(false)
    editModal.close()
  }

  /**
   * Handle form cancellation
   */
  const handleFormCancel = () => {
    setShowForm(false)
    editModal.close()
  }

  /**
   * Open edit form for a subadmin
   */
  const handleEdit = (subadmin: Subadmin) => {
    editModal.open(subadmin)
    setShowForm(true)
  }

  /**
   * Delete a subadmin
   */
  const handleDelete = async (userId: string) => {
    try {
      await executeAction(userId, 'delete', async () => {
        await deleteMutation.mutateAsync(userId)
      })
      setMessage(t('removedSuccessfully'))
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.REMOVE_SUBADMIN
      setMessage(errorMessage)
      console.error(CONSOLE_MESSAGES.ERROR_REMOVING_SUBADMIN, err)
    }
  }

  /**
   * Toggle subadmin active status
   */
  const handleToggleActive = async (subadmin: Subadmin) => {
    try {
      await executeAction(subadmin.id, 'toggle', async () => {
        await updateMutation.mutateAsync({
          userId: subadmin.id,
          updates: {
            can_upload_documents: subadmin.permissions.can_upload_documents,
            can_view_stats: subadmin.permissions.can_view_stats,
            is_active: !subadmin.permissions.is_active,
          },
        })
      })
      setMessage(t('updatedSuccessfully'))
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.SAVE_SUBADMIN
      setMessage(errorMessage)
      console.error(CONSOLE_MESSAGES.ERROR_TOGGLING_SUBADMIN_STATUS, err)
    }
  }

  /**
   * Toggle form visibility
   */
  const handleToggleForm = () => {
    setShowForm(!showForm)
    if (showForm) {
      editModal.close()
    }
  }

  const isAnyLoading = isLoading || deleteMutation.isPending || updateMutation.isPending
  const mutationError = deleteMutation.error || updateMutation.error

  return (
    <SubadminManagementView
      subadmins={subadmins}
      users={users}
      isLoading={isAnyLoading}
      error={error}
      mutationError={mutationError}
      message={message}
      showForm={showForm}
      editingSubadmin={editModal.data}
      isActionLoading={isActionLoading}
      onFormSuccess={handleFormSuccess}
      onFormCancel={handleFormCancel}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleActive={handleToggleActive}
      onToggleForm={handleToggleForm}
    />
  )
}
