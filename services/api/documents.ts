/**
 * Documents API Service
 * 
 * Centralized service layer for all document-related API calls.
 * Provides type-safe functions for fetching, creating, updating, and deleting documents.
 * 
 * All functions handle error cases and return properly typed responses.
 */

import { API_ENDPOINTS } from '@/constants/api'
import type {
  Document,
  SerializedDocument,
  DocumentUploadData,
  DocumentSearchFilters,
  SerializedVersion,
} from '@/types'
import type { ApiError, ApiResponse } from '@/types/api'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Normalize a document from API response
 * Converts SerializedDocument to Document format
 */
function normalizeDocument(doc: SerializedDocument | Document): Document {
  // Helper to safely convert date to ISO string
  const toISOString = (date: string | Date | null | undefined): string => {
    if (!date) {
      return new Date().toISOString() // Default to current date if missing
    }
    if (typeof date === 'string') {
      return date
    }
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return new Date().toISOString() // Invalid date, use current date
      }
      return dateObj.toISOString()
    } catch {
      return new Date().toISOString() // Fallback to current date
    }
  }

  return {
    ...doc,
    file_size:
      typeof doc.file_size === 'bigint'
        ? Number(doc.file_size)
        : typeof doc.file_size === 'number'
        ? doc.file_size
        : 0,
    created_at: toISOString(doc.created_at),
    updated_at: toISOString(doc.updated_at),
  }
}

/**
 * Fetch documents with optional filters
 */
export async function fetchDocuments(
  filters?: DocumentSearchFilters
): Promise<Document[]> {
  try {
    const params = new URLSearchParams()

    if (filters?.category) {
      params.append('category', filters.category)
    }
    if (filters?.fileType) {
      params.append('fileType', filters.fileType)
    }
    if (filters?.featuredOnly) {
      params.append('featuredOnly', 'true')
    }
    if (filters?.searchQuery) {
      params.append('searchQuery', filters.searchQuery)
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','))
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate)
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate)
    }
    if (filters?.sort) {
      params.append('sort', filters.sort)
    }

    const response = await fetch(
      `${API_ENDPOINTS.DOCUMENTS}?${params.toString()}`
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_DOCUMENTS

      throw new Error(errorMessage)
    }

    const documents: Document[] = Array.isArray(data)
      ? data.map(normalizeDocument)
      : []

    return documents
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.FETCH_DOCUMENTS
    throw new Error(message)
  }
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocumentById(id: string): Promise<Document> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_BY_ID(id))
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_DOCUMENTS

      throw new Error(errorMessage)
    }

    return normalizeDocument(data)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.FETCH_DOCUMENTS
    throw new Error(message)
  }
}

/**
 * Fetch document versions
 */
export async function fetchDocumentVersions(
  id: string
): Promise<Document[]> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_VERSIONS(id))
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to fetch document versions'

      throw new Error(errorMessage)
    }

    const documents: Document[] = Array.isArray(data)
      ? data.map(normalizeDocument)
      : []
    
    return documents
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch document versions'
    throw new Error(message)
  }
}

/**
 * Upload a new document
 */
export async function uploadDocument(
  uploadData: DocumentUploadData
): Promise<Document> {
  try {
    const formData = new FormData()
    formData.append('title', uploadData.title)
    formData.append('category', uploadData.category)
    formData.append('file', uploadData.file)

    if (uploadData.description) {
      formData.append('description', uploadData.description)
    }
    if (uploadData.tags && uploadData.tags.length > 0) {
      formData.append('tags', JSON.stringify(uploadData.tags))
    }
    if (uploadData.is_featured !== undefined) {
      formData.append('is_featured', String(uploadData.is_featured))
    }
    if (uploadData.searchable_content) {
      formData.append('searchable_content', uploadData.searchable_content)
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENT_UPLOAD, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to upload document'

      throw new Error(errorMessage)
    }

    return normalizeDocument(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload document'
    throw new Error(message)
  }
}

/**
 * Update a document
 * Note: For file uploads, use uploadDocument. This function only updates metadata.
 */
export async function updateDocument(
  id: string,
  updates: Partial<DocumentUploadData>
): Promise<Document> {
  try {
    // Prepare JSON body (API expects JSON, not FormData for metadata updates)
    const body: Record<string, unknown> = {}

    if (updates.title !== undefined) {
      body.title = updates.title.trim()
    }
    if (updates.category !== undefined) {
      body.category = updates.category.trim()
    }
    if (updates.description !== undefined) {
      body.description = updates.description.trim() || null
    }
    if (updates.tags !== undefined) {
      body.tags = updates.tags
    }
    if (updates.is_featured !== undefined) {
      body.is_featured = updates.is_featured
    }
    if (updates.searchable_content !== undefined) {
      body.searchable_content = updates.searchable_content || null
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENT_BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to update document'

      throw new Error(errorMessage)
    }

    return normalizeDocument(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update document'
    throw new Error(message)
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_BY_ID(id), {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to delete document'

      throw new Error(errorMessage)
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete document'
    throw new Error(message)
  }
}

/**
 * Fetch document filter options (categories, file types, tags)
 */
export async function fetchDocumentFilterOptions(): Promise<{
  categories: string[]
  fileTypes: string[]
  tags: string[]
}> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_FILTER_OPTIONS)
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to fetch filter options'

      throw new Error(errorMessage)
    }

    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      fileTypes: Array.isArray(data.fileTypes) ? data.fileTypes : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch filter options'
    throw new Error(message)
  }
}

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(id: string): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_DOWNLOAD_URL(id))
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to get download URL'

      throw new Error(errorMessage)
    }

    return typeof data.url === 'string' ? data.url : ''
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get download URL'
    throw new Error(message)
  }
}

/**
 * Convert document for editor (returns HTML for DOCX or PDF URL)
 */
/**
 * Save a document version (edited content)
 */
export async function saveDocumentVersion(
  id: string,
  data: {
    html_content?: string | null
    pdf_text_content?: string | null
    pdf_annotations?: unknown[] | null
    version_name?: string | null
  }
): Promise<{ id: string; message: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_EDIT(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string' &&
          result.error) ||
        ERROR_MESSAGES.SAVE_DOCUMENT

      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.SAVE_DOCUMENT
    throw new Error(message)
  }
}

/**
 * Export document to specified format
 */
export async function exportDocument(
  id: string,
  versionId: string,
  format: 'docx' | 'pdf'
): Promise<{ signedUrl: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_EXPORT(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version_id: versionId,
        export_format: format,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string' &&
          result.error) ||
        ERROR_MESSAGES.EXPORT_DOCUMENT

      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.EXPORT_DOCUMENT
    throw new Error(message)
  }
}

/**
 * Get user's edited versions of a document
 */
export async function getUserDocumentVersions(id: string): Promise<SerializedVersion[]> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_EDIT(id))

    if (!response.ok) {
      const data = await response.json()
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to fetch document versions'

      throw new Error(errorMessage)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch document versions'
    throw new Error(message)
  }
}

export async function convertDocumentForEditor(id: string): Promise<{
  type: 'docx' | 'pdf'
  content?: string
  pdfUrl?: string
  pageCount?: number
}> {
  try {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_CONVERT(id))

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format')
    }

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to convert document'

      throw new Error(errorMessage)
    }

    return {
      type: data.type || 'docx',
      content: data.content || data.html, // Support both 'content' and 'html' for backward compatibility
      pdfUrl: data.pdfUrl,
      pageCount: data.pageCount || data.numPages, // Support both 'pageCount' and 'numPages'
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to convert document'
    throw new Error(message)
  }
}

