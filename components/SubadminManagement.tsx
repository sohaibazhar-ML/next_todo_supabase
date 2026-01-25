'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ERROR_MESSAGES } from '@/constants'
import { useSubadmins, useDeleteSubadmin, useUpdateSubadmin } from '@/hooks/api/useSubadmins'
import { useUsers } from '@/hooks/api/useUsers'
import { IconSpinner } from '@/components/ui/icons'
import { SubadminForm } from '@/components/forms/SubadminForm'
import { SuccessMessage, ErrorMessage } from '@/components/ui'
import type { Subadmin } from '@/services/api/subadmins'

export default function SubadminManagement() {
  const t = useTranslations('subadmin')
  const [message, setMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Use React Query hooks for data fetching
  const { data: subadmins = [], isLoading, error } = useSubadmins()
  const { data: users = [] } = useUsers({ role: 'user' })
  
  // Mutations
  const deleteMutation = useDeleteSubadmin()
  const updateMutation = useUpdateSubadmin()

  const editingSubadmin = editingId
    ? subadmins.find(s => s.id === editingId) || null
    : null

  const handleFormSuccess = () => {
    setMessage(t('updatedSuccessfully'))
    setShowForm(false)
    setEditingId(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (subadmin: Subadmin) => {
    setEditingId(subadmin.id)
    setShowForm(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm(t('confirmRemove'))) {
      return
    }

    try {
      await deleteMutation.mutateAsync(userId)
      setMessage(t('removedSuccessfully'))
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.REMOVE_SUBADMIN
      setMessage(errorMessage)
      console.error('Error removing subadmin:', err)
    }
  }

  const handleToggleActive = async (subadmin: Subadmin) => {
    try {
      await updateMutation.mutateAsync({
        userId: subadmin.id,
        updates: {
          can_upload_documents: subadmin.permissions.can_upload_documents,
          can_view_stats: subadmin.permissions.can_view_stats,
          is_active: !subadmin.permissions.is_active,
        },
      })
      setMessage(t('updatedSuccessfully'))
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : ERROR_MESSAGES.SAVE_SUBADMIN
      setMessage(errorMessage)
      console.error('Error toggling subadmin active status:', err)
    }
  }

  const isAnyLoading = isLoading || deleteMutation.isPending || updateMutation.isPending
  const mutationError = deleteMutation.error || updateMutation.error

  if (isAnyLoading && subadmins.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {message && (
        <SuccessMessage
          message={message}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? t('cancel') : t('addSubadmin')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? t('editSubadmin') : t('addSubadmin')}
          </h3>
          <SubadminForm
            editingSubadmin={editingSubadmin}
            availableUsers={users}
            existingSubadmins={subadmins}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('subadminsList')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {subadmins.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {t('noSubadmins')}
            </div>
          ) : (
            subadmins.map((subadmin) => (
              <div key={subadmin.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {subadmin.first_name.charAt(0)}{subadmin.last_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {subadmin.first_name} {subadmin.last_name}
                        </h4>
                        <p className="text-xs text-gray-500">@{subadmin.username}</p>
                        <p className="text-xs text-gray-400">{subadmin.email}</p>
                      </div>
                    </div>
                    <div className="ml-13 space-y-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subadmin.permissions.can_upload_documents
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {subadmin.permissions.can_upload_documents ? '✓' : '✗'} {t('canUploadDocuments')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subadmin.permissions.can_view_stats
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {subadmin.permissions.can_view_stats ? '✓' : '✗'} {t('canViewStats')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subadmin.permissions.is_active
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subadmin.permissions.is_active ? t('active') : t('inactive')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(subadmin)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        subadmin.permissions.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {subadmin.permissions.is_active ? t('deactivate') : t('activate')}
                    </button>
                    <button
                      onClick={() => handleEdit(subadmin)}
                      className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(subadmin.id)}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

