/**
 * React Query Hooks for Documents
 * 
 * Provides data fetching, caching, and mutation hooks for document operations.
 * Uses React Query for automatic caching, refetching, and state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Document,
  DocumentUploadData,
  DocumentSearchFilters,
  SerializedVersion,
} from '@/types'
import * as documentsApi from '@/services/api/documents'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Fetch documents with filters
 */
export function useDocuments(filters?: DocumentSearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.list(filters),
    queryFn: () => documentsApi.fetchDocuments(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch a single document by ID
 */
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error(ERROR_MESSAGES.DOCUMENT_ID_REQUIRED)
      return documentsApi.fetchDocumentById(id)
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch document versions
 */
export function useDocumentVersions(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.versions(id || ''),
    queryFn: () => {
      if (!id) throw new Error(ERROR_MESSAGES.DOCUMENT_ID_REQUIRED)
      return documentsApi.fetchDocumentVersions(id)
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch document filter options
 */
export function useDocumentFilterOptions() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.filterOptions(),
    queryFn: () => documentsApi.fetchDocumentFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes (filter options don't change often)
  })
}

/**
 * Upload document mutation
 */
export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DocumentUploadData) =>
      documentsApi.uploadDocument(data),
    onSuccess: () => {
      // Invalidate document lists to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.filterOptions() })
    },
  })
}

/**
 * Update document mutation
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DocumentUploadData> }) =>
      documentsApi.updateDocument(id, updates),
    onSuccess: (data, variables) => {
      // Update the specific document in cache
      queryClient.setQueryData(QUERY_KEYS.documents.detail(variables.id), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.lists() })
    },
  })
}

/**
 * Delete document mutation
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.documents.detail(id) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.lists() })
    },
  })
}

/**
 * Get document download URL
 */
export function useDocumentDownloadUrl(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.downloadUrl(id || ''),
    queryFn: () => {
      if (!id) throw new Error(ERROR_MESSAGES.DOCUMENT_ID_REQUIRED)
      return documentsApi.getDocumentDownloadUrl(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes (signed URLs are valid for a while)
  })
}

/**
 * Convert document for editor
 */
export function useConvertDocumentForEditor(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.convert(id || ''),
    queryFn: () => {
      if (!id) throw new Error(ERROR_MESSAGES.DOCUMENT_ID_REQUIRED)
      return documentsApi.convertDocumentForEditor(id)
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}


/**
 * Fetch user's edited versions of a document
 */
export function useUserDocumentVersions(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.userVersions(id || ''),
    queryFn: () => {
      if (!id) throw new Error(ERROR_MESSAGES.DOCUMENT_ID_REQUIRED)
      return documentsApi.getUserDocumentVersions(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}
