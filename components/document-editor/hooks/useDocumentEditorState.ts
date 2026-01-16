/**
 * Hook for managing document editor state
 * 
 * This hook centralizes all state management for the document editor,
 * including document content, PDF viewer state, annotations, and search.
 * 
 * Usage:
 *   const editorState = useDocumentEditorState()
 */

import { useState, useRef } from 'react'
import { DEFAULT_VALUES } from '@/constants'
import type {
  DocumentType,
  PDFAnnotation,
  SearchResult,
} from '@/types/documentEditor'

/**
 * Return type for useDocumentEditorState hook
 */
export interface UseDocumentEditorStateReturn {
  // Document state
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  content: string
  setContent: (content: string) => void
  documentType: DocumentType
  setDocumentType: (type: DocumentType) => void

  // Version state
  versions: import('@/types/documentEditor').UserVersion[]
  setVersions: (versions: import('@/types/documentEditor').UserVersion[]) => void
  versionName: string
  setVersionName: (name: string) => void
  showVersions: boolean
  setShowVersions: (show: boolean) => void

  // PDF viewer state
  pdfUrl: string | null
  setPdfUrl: (url: string | null) => void
  numPages: number | null
  setNumPages: (pages: number | null) => void
  pageNumber: number
  setPageNumber: (page: number) => void
  scale: number
  setScale: (scale: number) => void
  pdfLoading: boolean
  setPdfLoading: (loading: boolean) => void

  // Annotation state
  annotations: PDFAnnotation[]
  setAnnotations: (annotations: PDFAnnotation[]) => void
  activeTool: 'select' | 'highlight' | 'text' | 'sticky' | null
  setActiveTool: (tool: 'select' | 'highlight' | 'text' | 'sticky' | null) => void
  selectedAnnotation: string | null
  setSelectedAnnotation: (id: string | null) => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void
  currentSearchIndex: number
  setCurrentSearchIndex: (index: number) => void

  // Refs
  isSettingContentRef: React.MutableRefObject<boolean>
  pageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
}

/**
 * Hook for managing all document editor state
 * 
 * Centralizes state management to reduce prop drilling and improve organization.
 * 
 * @returns Object containing all state values and setters
 */
export function useDocumentEditorState(): UseDocumentEditorStateReturn {
  // Document state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [documentType, setDocumentType] = useState<DocumentType>(null)

  // Version state
  const [versions, setVersions] = useState<
    import('@/types/documentEditor').UserVersion[]
  >([])
  const [versionName, setVersionName] = useState('')
  const [showVersions, setShowVersions] = useState(false)

  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(DEFAULT_VALUES.PDF_PAGE_NUMBER)
  const [scale, setScale] = useState<number>(DEFAULT_VALUES.PDF_SCALE)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Annotation state
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([])
  const [activeTool, setActiveTool] = useState<
    'select' | 'highlight' | 'text' | 'sticky' | null
  >(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  )

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)

  // Refs
  const isSettingContentRef = useRef(false)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  return {
    // Document state
    loading,
    setLoading,
    error,
    setError,
    content,
    setContent,
    documentType,
    setDocumentType,

    // Version state
    versions,
    setVersions,
    versionName,
    setVersionName,
    showVersions,
    setShowVersions,

    // PDF viewer state
    pdfUrl,
    setPdfUrl,
    numPages,
    setNumPages,
    pageNumber,
    setPageNumber,
    scale,
    setScale,
    pdfLoading,
    setPdfLoading,

    // Annotation state
    annotations,
    setAnnotations,
    activeTool,
    setActiveTool,
    selectedAnnotation,
    setSelectedAnnotation,

    // Search state
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    currentSearchIndex,
    setCurrentSearchIndex,

    // Refs
    isSettingContentRef,
    pageRefs,
  }
}

