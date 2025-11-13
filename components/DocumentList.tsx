'use client'

import { useState, useEffect } from 'react'
import type { Document, DocumentSearchFilters } from '@/types/document'
import DocumentCard from './DocumentCard'
import DocumentSearch from './DocumentSearch'

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DocumentSearchFilters>({})
  const [categories, setCategories] = useState<string[]>([])
  const [fileTypes, setFileTypes] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    fetchFilterOptions()
    fetchDocuments()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [filters])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/documents/filter-options')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        setFileTypes(data.fileTypes || [])
        setTags(data.tags || [])
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.fileType) params.append('fileType', filters.fileType)
      if (filters.featuredOnly) params.append('featuredOnly', 'true')
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery)
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))

      const response = await fetch(`/api/documents?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents')
      }

      // Convert BigInt file_size to number if needed
      const documents = Array.isArray(data) ? data.map((doc: any) => ({
        ...doc,
        file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size
      })) : []

      setDocuments(documents)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents')
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: DocumentSearchFilters) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12">
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <DocumentSearch
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          fileTypes={fileTypes}
          tags={tags}
        />
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-white font-medium">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'} found
        </p>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {filters.searchQuery || filters.category || filters.fileType
                ? 'Try adjusting your search or filters'
                : 'No documents available yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  )
}

