'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { DocumentUploadData } from '@/types/document'

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
  const supabase = createClient()
  const router = useRouter()

  const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']
  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.zip']

  const getFileType = (fileName: string): 'PDF' | 'DOCX' | 'XLSX' | 'ZIP' => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf':
        return 'PDF'
      case 'docx':
        return 'DOCX'
      case 'xlsx':
        return 'XLSX'
      case 'zip':
        return 'ZIP'
      default:
        return 'PDF'
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to upload documents')
      }

      // Verify user is admin via API
      const profileResponse = await fetch(`/api/profiles?userId=${user.id}`)
      if (!profileResponse.ok) {
        throw new Error('Failed to verify admin status')
      }
      const profile = await profileResponse.json()
      if (profile?.role !== 'admin') {
        throw new Error('Admin access required')
      }

      // Generate unique file path
      const fileExt = formData.file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          throw new Error(
            'Storage bucket not found. Please run the storage bucket setup SQL migration in Supabase Dashboard. ' +
            'Go to SQL Editor and run: supabase/migrations/20240101000001_storage_bucket_setup.sql'
          )
        }
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Insert document record via API
      const docResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
          file_name: formData.file.name,
          file_path: filePath,
          file_size: formData.file.size,
          file_type: getFileType(formData.file.name),
          mime_type: formData.file.type,
          is_featured: formData.is_featured || false,
          searchable_content: formData.searchable_content || null,
        })
      })

      if (!docResponse.ok) {
        // If insert fails, try to delete uploaded file
        await supabase.storage.from('documents').remove([filePath])
        const data = await docResponse.json()
        throw new Error(`Failed to create document record: ${data.error || 'Unknown error'}`)
      }

      setMessage('Document uploaded successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        file: null as any,
        is_featured: false,
      })
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
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
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  )
}

