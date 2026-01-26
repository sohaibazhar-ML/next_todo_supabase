/**
 * Document Search Form Hook
 * 
 * Custom hook for managing document search form state.
 * Uses React Hook Form with Zod validation.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { documentSearchSchema, type DocumentSearchFormData } from './documentSearchSchema'
import type { DocumentSearchFilters, DocumentFileType } from '@/types/document'

export interface UseDocumentSearchFormOptions {
  /**
   * Initial filters
   */
  initialFilters?: DocumentSearchFilters
  
  /**
   * Callback when filters change
   */
  onFilterChange: (filters: DocumentSearchFilters) => void
}

export interface UseDocumentSearchFormReturn {
  /**
   * React Hook Form instance
   */
  form: ReturnType<typeof useForm<DocumentSearchFormData>>
  
  /**
   * Submit handler (wrapped for form submission)
   */
  onSubmit: (e: React.FormEvent) => void
  
  /**
   * Reset handler
   */
  onReset: () => void
}

/**
 * Hook for managing document search form
 */
export function useDocumentSearchForm({
  initialFilters,
  onFilterChange,
}: UseDocumentSearchFormOptions): UseDocumentSearchFormReturn {
  const form = useForm<DocumentSearchFormData>({
    resolver: zodResolver(documentSearchSchema),
    defaultValues: {
      searchQuery: initialFilters?.searchQuery || '',
      category: initialFilters?.category || '',
      fileType: initialFilters?.fileType || '',
      tags: initialFilters?.tags || [],
      featuredOnly: initialFilters?.featuredOnly || false,
    },
    mode: 'onChange',
  })

  // Sync form with initial filters
  useEffect(() => {
    if (initialFilters) {
      form.reset({
        searchQuery: initialFilters.searchQuery || '',
        category: initialFilters.category || '',
        fileType: initialFilters.fileType || '',
        tags: initialFilters.tags || [],
        featuredOnly: initialFilters.featuredOnly || false,
      })
    }
  }, [initialFilters, form])

  const handleSubmit = (data: DocumentSearchFormData) => {
    const filters: DocumentSearchFilters = {
      searchQuery: data.searchQuery?.trim() || undefined,
      category: data.category || undefined,
      fileType: (data.fileType as DocumentFileType) || undefined,
      tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
      featuredOnly: data.featuredOnly || undefined,
    }
    onFilterChange(filters)
  }

  const onReset = () => {
    form.reset({
      searchQuery: '',
      category: '',
      fileType: '',
      tags: [],
      featuredOnly: false,
    })
    onFilterChange({})
  }

  const wrappedOnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit(handleSubmit)()
  }

  return {
    form,
    onSubmit: wrappedOnSubmit,
    onReset,
  }
}
