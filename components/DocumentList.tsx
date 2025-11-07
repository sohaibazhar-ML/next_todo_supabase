'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  useEffect(() => {
    fetchFilterOptions()
    fetchDocuments()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [filters])

  const fetchFilterOptions = async () => {
    try {
      // Fetch all documents to get unique categories, file types, and tags
      const { data } = await supabase
        .from('documents')
        .select('category, file_type, tags')

      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(doc => doc.category))).sort()
        const uniqueFileTypes = Array.from(new Set(data.map(doc => doc.file_type))).sort()
        
        // Extract all unique tags from all documents
        const allTags = new Set<string>()
        data.forEach(doc => {
          if (doc.tags && Array.isArray(doc.tags)) {
            doc.tags.forEach(tag => allTags.add(tag))
          }
        })
        const uniqueTags = Array.from(allTags).sort()
        
        setCategories(uniqueCategories)
        setFileTypes(uniqueFileTypes)
        setTags(uniqueTags)
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.fileType) {
        query = query.eq('file_type', filters.fileType)
      }

      if (filters.featuredOnly) {
        query = query.eq('is_featured', true)
      }

      // If search query exists, use full-text search function
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const { data, error: searchError } = await supabase.rpc('search_documents', {
          search_query: filters.searchQuery,
          p_category: filters.category || null,
          p_file_type: filters.fileType || null,
          p_limit: 100,
          p_offset: 0,
        })

        if (searchError) {
          throw searchError
        }

        // Map the RPC result to Document type
        let mappedDocuments = (data || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          tags: doc.tags,
          file_name: doc.file_name,
          file_path: doc.file_path,
          file_size: doc.file_size,
          file_type: doc.file_type,
          mime_type: '', // RPC doesn't return this
          version: null,
          parent_document_id: null,
          is_active: true, // Keep for type compatibility, but not used
          is_featured: false,
          download_count: doc.download_count,
          searchable_content: null,
          created_at: doc.created_at,
          updated_at: doc.created_at,
          created_by: null,
        }))

        // Filter by tags if selected
        if (filters.tags && filters.tags.length > 0) {
          mappedDocuments = mappedDocuments.filter((doc: Document) => {
            if (!doc.tags || !Array.isArray(doc.tags)) return false
            return filters.tags!.some(selectedTag => doc.tags!.includes(selectedTag))
          })
        }

        setDocuments(mappedDocuments)
        setLoading(false)
        return
      }

      // Regular query without search
      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      // Filter by tags client-side (documents that contain any of the selected tags)
      let filteredDocuments = data || []
      if (filters.tags && filters.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter((doc: Document) => {
          if (!doc.tags || !Array.isArray(doc.tags)) return false
          // Check if document's tags array contains any of the selected tags
          return filters.tags!.some(selectedTag => doc.tags!.includes(selectedTag))
        })
      }

      setDocuments(filteredDocuments)
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

