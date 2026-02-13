/**
 * Subadmin List Table
 * 
 * Renders the table/list of subadmins with all actions.
 * Pure presentational component with no business logic.
 * 
 * Responsibilities:
 * - Render subadmin cards
 * - Render subadmin metadata and permissions
 * - Render action buttons with loading states
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Subadmin } from '@/services/api/subadmins'
import type { SubadminActionType } from '@/hooks/useSubadminActions'
import { ActionButton } from '@/components/ui'

interface SubadminListTableProps {
  subadmins: Subadmin[]
  isActionLoading: (subadminId: string, action: SubadminActionType) => boolean
  onEdit: (subadmin: Subadmin) => void
  onDelete: (userId: string) => Promise<void>
  onToggleActive: (subadmin: Subadmin) => Promise<void>
}

export default function SubadminListTable({
  subadmins,
  isActionLoading,
  onEdit,
  onDelete,
  onToggleActive,
}: SubadminListTableProps) {
  const t = useTranslations('subadmin')

  const handleDeleteClick = (userId: string) => {
    if (confirm(t('confirmRemove'))) {
      onDelete(userId)
    }
  }

  return (
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
                {/* Subadmin Info */}
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

                  {/* Permissions */}
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <ActionButton
                    variant={subadmin.permissions.is_active ? 'deactivate' : 'activate'}
                    loading={isActionLoading(subadmin.id, 'toggle')}
                    onClick={() => onToggleActive(subadmin)}
                  >
                    {subadmin.permissions.is_active ? t('deactivate') : t('activate')}
                  </ActionButton>
                  <ActionButton
                    variant="edit"
                    onClick={() => onEdit(subadmin)}
                  >
                    {t('edit')}
                  </ActionButton>
                  <ActionButton
                    variant="remove"
                    loading={isActionLoading(subadmin.id, 'delete')}
                    onClick={() => handleDeleteClick(subadmin.id)}
                  >
                    {t('remove')}
                  </ActionButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
