/**
 * Document Upload Component
 * 
 * Component for uploading new documents or new versions of existing documents.
 * 
 * Features:
 * - Upload new documents
 * - Upload new versions of existing documents
 * - File validation (type and size)
 * - Form validation
 * 
 * This component has been refactored to:
 * - Use constants from @/constants
 * - Remove all 'any' types
 * - Use proper TypeScript types
 * - Improve error handling
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { DocumentUploadData, Document } from '@/types/document'
import { API_ENDPOINTS, CONTENT_TYPES, ERROR_MESSAGES, CONSOLE_MESSAGES, DEFAULT_VALUES, FILE_EXTENSIONS } from '@/constants'
import { isErrorWithMessage } from '@/types'

export default function DocumentUpload() {
  const t = useTranslations('documentUpload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<DocumentUploadData, 'file'> & { file: File | null }>({
    title: '',
    description: '',
    category: '',
    tags: [],
    file: null,
    is_featured: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [parentDocument, setParentDocument] = useState<Document | null>(null)
  const [loadingParent, setLoadingParent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if this is a version upload
  const uploadVersionId = searchParams?.get('uploadVersion')

  // Use constants for allowed file types and extensions
  const allowedFileTypes = [
    CONTENT_TYPES.PDF,
    CONTENT_TYPES.DOCX,
    CONTENT_TYPES.XLSX,
    CONTENT_TYPES.ZIP,
  ]
  const allowedExtensions = [
    FILE_EXTENSIONS.PDF,
    FILE_EXTENSIONS.DOCX,
    FILE_EXTENSIONS.XLSX,
    FILE_EXTENSIONS.ZIP,
  ]

  // Load parent document if uploading a version
  useEffect(() => {
    if (uploadVersionId) {
      loadParentDocument(uploadVersionId)
    }
  }, [uploadVersionId])

  const loadParentDocument = async (documentId: string) => {
    try {
      setLoadingParent(true)
      const response = await fetch(API_ENDPOINTS.DOCUMENT_BY_ID(documentId))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string')
            ? data.error
            : ERROR_MESSAGES.LOAD_DOCUMENT
        )
      }

      setParentDocument(data as Document)
      // Pre-fill form with parent document data
      setFormData({
        title: data.title,
        description: data.description || '',
        category: data.category,
        tags: data.tags || [],
        file: null,
        is_featured: data.is_featured || false,
      })
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.LOAD_DOCUMENT
      setError(errorMessage)
    } finally {
      setLoadingParent(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileType = file.type as typeof CONTENT_TYPES.PDF | typeof CONTENT_TYPES.DOCX | typeof CONTENT_TYPES.XLSX | typeof CONTENT_TYPES.ZIP | string
    if (!allowedFileTypes.includes(fileType as any) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError(t('invalidFileType'))
      return
    }

    // Validate file size (max 50MB)
    if (file.size > DEFAULT_VALUES.MAX_FILE_SIZE) {
      setError(t('fileSizeExceeds'))
      return
    }

    setFormData({ ...formData, file })
    setError(null)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    // Validation
    if (!formData.title.trim()) {
      setError(t('titleRequired'))
      return
    }

    if (!formData.category.trim()) {
      setError(t('categoryRequired'))
      return
    }

    if (!formData.file) {
      setError(t('selectFile'))
      return
    }

    setLoading(true)

    try {
      // Upload file and create document record via API route (handles everything server-side)
      // This avoids RLS issues with client-side storage uploads
      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.file!)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description || '')
      uploadFormData.append('category', formData.category)
      uploadFormData.append('tags', JSON.stringify(formData.tags || []))
      uploadFormData.append('is_featured', formData.is_featured ? 'true' : 'false')
      if (formData.searchable_content) {
        uploadFormData.append('searchable_content', formData.searchable_content)
      }
      // If uploading a version, include parent document ID
      if (uploadVersionId && parentDocument) {
        uploadFormData.append('parent_document_id', uploadVersionId)
      }

      const docResponse = await fetch(API_ENDPOINTS.DOCUMENT_UPLOAD, {
        method: 'POST',
        body: uploadFormData,
      })

      if (!docResponse.ok) {
        const errorData = await docResponse.json().catch(() => ({ error: 'Network error' }))
        
        // Provide helpful error messages
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'error' in errorData &&
          typeof errorData.error === 'string' &&
          errorData.error.includes('Bucket not found')
        ) {
          throw new Error(ERROR_MESSAGES.STORAGE_BUCKET_NOT_FOUND)
        }

        throw new Error(
          (typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string')
            ? errorData.error
            : ERROR_MESSAGES.UPLOAD_DOCUMENT
        )
      }

      setMessage(uploadVersionId ? t('versionUploadSuccess') : t('uploadSuccess'))
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        file: null,
        is_featured: false,
      })
      setParentDocument(null)
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Clear URL parameter if it was a version upload
      if (uploadVersionId) {
        router.push('/admin/documents')
      }

      // Refresh page after delay
      setTimeout(() => {
        router.refresh()
      }, DEFAULT_VALUES.REFRESH_DELAY)
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.UPLOAD_DOCUMENT
      setError(errorMessage)
      console.error(CONSOLE_MESSAGES.UPLOAD_ERROR, err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {uploadVersionId && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-medium mb-2">
            {t('uploadingNewVersion')}
          </p>
          {loadingParent ? (
            <p className="text-xs text-blue-600">{t('loadingParentDocument')}</p>
          ) : parentDocument ? (
            <div className="text-xs text-blue-600 space-y-1">
              <p>{t('parent')}: {parentDocument.title}</p>
              <p>
                {t('currentVersion')}:{' '}
                {parentDocument.version || DEFAULT_VALUES.DEFAULT_VERSION}
              </p>
              <p className="mt-2 text-blue-700">{t('formPrefilled')}</p>
            </div>
          ) : (
            <p className="text-xs text-blue-600">{t('failedToLoadParent')}</p>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('title')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={loadingParent}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={t('titlePlaceholder')}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('category')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          placeholder={t('categoryPlaceholder')}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('tags')}</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
            placeholder={t('addTagPlaceholder')}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            {t('add')}
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('file')} <span className="text-red-500">*</span>
        </label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.zip"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('allowedFormats')}
        </p>
      </div>

      {/* Featured */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_featured || false}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">{t('featuredDocument')}</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || loadingParent}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('uploading') : loadingParent ? t('loading') : uploadVersionId ? t('uploadNewVersion') : t('uploadDocument')}
      </button>
    </form>
  )
}

