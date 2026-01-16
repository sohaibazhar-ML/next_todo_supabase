'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { API_ENDPOINTS, CONTENT_TYPES } from '@/constants'

interface Subadmin {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  permissions: {
    can_upload_documents: boolean
    can_view_stats: boolean
    is_active: boolean
  }
  created_at: string
  updated_at: string
}

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

export default function SubadminManagement() {
  const t = useTranslations('subadmin')
  const [subadmins, setSubadmins] = useState<Subadmin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    can_upload_documents: false,
    can_view_stats: false,
    is_active: true,
  })

  useEffect(() => {
    fetchSubadmins()
    fetchUsers()
  }, [])

  const fetchSubadmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMINS)
      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to fetch subadmins')
        return
      }
      const data = await response.json()
      setSubadmins(data)
    } catch (err) {
      setError('Failed to fetch subadmins')
      console.error('Error fetching subadmins:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFILES}?role=user`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    try {
      const url = editingId
        ? API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(editingId)
        : API_ENDPOINTS.ADMIN_SUBADMINS
      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': CONTENT_TYPES.JSON },
        body: JSON.stringify(editingId ? {
          can_upload_documents: formData.can_upload_documents,
          can_view_stats: formData.can_view_stats,
          is_active: formData.is_active,
        } : {
          userId: formData.userId,
          can_upload_documents: formData.can_upload_documents,
          can_view_stats: formData.can_view_stats,
          is_active: formData.is_active,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save subadmin')
        return
      }

      setMessage(editingId ? t('updatedSuccessfully') : t('createdSuccessfully'))
      setShowForm(false)
      setEditingId(null)
      setFormData({
        userId: '',
        can_upload_documents: false,
        can_view_stats: false,
        is_active: true,
      })
      fetchSubadmins()
      fetchUsers()
    } catch (err) {
      setError('Failed to save subadmin')
      console.error('Error saving subadmin:', err)
    }
  }

  const handleEdit = (subadmin: Subadmin) => {
    setEditingId(subadmin.id)
    setFormData({
      userId: subadmin.id,
      can_upload_documents: subadmin.permissions.can_upload_documents,
      can_view_stats: subadmin.permissions.can_view_stats,
      is_active: subadmin.permissions.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm(t('confirmRemove'))) {
      return
    }

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(userId), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to remove subadmin')
        return
      }

      setMessage(t('removedSuccessfully'))
      fetchSubadmins()
      fetchUsers()
    } catch (err) {
      setError('Failed to remove subadmin')
      console.error('Error removing subadmin:', err)
    }
  }

  const handleToggleActive = async (subadmin: Subadmin) => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(subadmin.id), {
        method: 'PATCH',
        headers: { 'Content-Type': CONTENT_TYPES.JSON },
        body: JSON.stringify({
          is_active: !subadmin.permissions.is_active,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update subadmin')
        return
      }

      setMessage(t('updatedSuccessfully'))
      fetchSubadmins()
    } catch (err) {
      setError('Failed to update subadmin')
      console.error('Error updating subadmin:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({
              userId: '',
              can_upload_documents: false,
              can_view_stats: false,
              is_active: true,
            })
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('selectUser')}
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  required
                >
                  <option value="" disabled className="text-gray-500">{t('selectUserPlaceholder')}</option>
                  {users
                    .filter(u => !subadmins.some(s => s.id === u.id))
                    .map(user => (
                      <option key={user.id} value={user.id} className="text-gray-900">
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.can_upload_documents}
                  onChange={(e) => setFormData({ ...formData, can_upload_documents: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{t('canUploadDocuments')}</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.can_view_stats}
                  onChange={(e) => setFormData({ ...formData, can_view_stats: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{t('canViewStats')}</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{t('isActive')}</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? t('update') : t('create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    userId: '',
                    can_upload_documents: false,
                    can_view_stats: false,
                    is_active: true,
                  })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
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

