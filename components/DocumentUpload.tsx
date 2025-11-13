'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { DocumentUploadData } from '@/types/document'
import type { Document } from '@/types/document'

export default function DocumentUpload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<DocumentUploadData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    file: null as any,
    is_featured: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [parentDocument, setParentDocument] = useState<Document | null>(null)
  const [loadingParent, setLoadingParent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if this is a version upload
  const uploadVersionId = searchParams?.get('uploadVersion')

  const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']
  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.zip']

  // Load parent document if uploading a version
  useEffect(() => {
    if (uploadVersionId) {
      loadParentDocument(uploadVersionId)
    }
  }, [uploadVersionId])

  const loadParentDocument = async (documentId: string) => {
    try {
      setLoadingParent(true)
      const response = await fetch(`/api/documents/${documentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load parent document')
      }

      setParentDocument(data)
      // Pre-fill form with parent document data
      setFormData({
        title: data.title,
        description: data.description || '',
        category: data.category,
        tags: data.tags || [],
        file: null as any,
        is_featured: data.is_featured || false,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load parent document')
    } finally {
      setLoadingParent(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!allowedFileTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('Invalid file type. Please upload PDF, DOCX, XLSX, or ZIP files only.')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit.')
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
      setError('Title is required')
      return
    }

    if (!formData.category.trim()) {
      setError('Category is required')
      return
    }

    if (!formData.file) {
      setError('Please select a file to upload')
      return
    }

    setLoading(true)

    try {
      // Upload file and create document record via API route (handles everything server-side)
      // This avoids RLS issues with client-side storage uploads
      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.file)
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

      const docResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!docResponse.ok) {
        const errorData = await docResponse.json().catch(() => ({ error: 'Network error' }))
        
        // Provide helpful error messages
        if (errorData.error?.includes('Bucket not found')) {
          throw new Error(
            'Storage bucket not found. Please run the storage bucket setup SQL migration in Supabase Dashboard. ' +
            'Go to SQL Editor and run: supabase/migrations/20240101000001_storage_bucket_setup.sql'
          )
        }
        
        throw new Error(errorData.error || `Upload failed: HTTP ${docResponse.status}`)
      }

      setMessage(uploadVersionId ? 'New version uploaded successfully!' : 'Document uploaded successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        file: null as any,
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

      // Refresh page after 1 second
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
      console.error('Upload error:', err)
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
            Uploading New Version
          </p>
          {loadingParent ? (
            <p className="text-xs text-blue-600">Loading parent document...</p>
          ) : parentDocument ? (
            <div className="text-xs text-blue-600 space-y-1">
              <p>Parent: {parentDocument.title}</p>
              <p>Current Version: {parentDocument.version || '1.0'}</p>
              <p className="mt-2 text-blue-700">The form is pre-filled with parent document details. You can modify them if needed.</p>
            </div>
          ) : (
            <p className="text-xs text-blue-600">Failed to load parent document</p>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={loadingParent}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Document title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          placeholder="Document description"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          placeholder="e.g., Immigration, Forms, Guides"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
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
            placeholder="Add tag and press Enter"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Add
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
          File <span className="text-red-500">*</span>
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
          Allowed: PDF, DOCX, XLSX, ZIP (Max 50MB)
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
          <span className="text-sm font-medium text-gray-700">Featured Document</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || loadingParent}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : loadingParent ? 'Loading...' : uploadVersionId ? 'Upload New Version' : 'Upload Document'}
      </button>
    </form>
  )
}

