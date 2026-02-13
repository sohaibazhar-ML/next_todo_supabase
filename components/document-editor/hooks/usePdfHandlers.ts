/**
 * Hook for PDF-specific event handlers
 * 
 * This hook provides handlers for PDF-specific interactions including:
 * - Page click handling for annotations
 * - Text extraction
 * - Search navigation
 * - Annotation management
 * 
 * Usage:
 *   const pdfHandlers = usePdfHandlers({ ... })
 */

import { useTranslations } from 'next-intl'
import { pdfjs } from 'react-pdf'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, THEME } from '@/constants'
import { isTextItem } from '@/types/documentEditor'
import type {
  PDFAnnotation,
  SearchResult,
} from '@/types/documentEditor'

/**
 * Props for usePdfHandlers hook
 */
interface UsePdfHandlersProps {
  /**
   * PDF URL
   */
  pdfUrl: string | null

  /**
   * Current page number
   */
  pageNumber: number

  /**
   * Total number of pages
   */
  numPages: number | null

  /**
   * Current search query
   */
  searchQuery: string

  /**
   * Current search results
   */
  searchResults: SearchResult[]

  /**
   * Current search index
   */
  currentSearchIndex: number

  /**
   * Active annotation tool
   */
  activeTool: 'select' | 'highlight' | 'text' | 'sticky' | null

  /**
   * Current annotations
   */
  annotations: PDFAnnotation[]

  /**
   * Callback to set PDF loading state
   */
  setPdfLoading: (loading: boolean) => void

  /**
   * Callback to set content
   */
  setContent: React.Dispatch<React.SetStateAction<string>>

  /**
   * Callback to set error
   */
  setError: (error: string | null) => void

  /**
   * Callback to set annotations
   */
  setAnnotations: React.Dispatch<React.SetStateAction<PDFAnnotation[]>>

  /**
   * Callback to set active tool
   */
  setActiveTool: (tool: 'select' | 'highlight' | 'text' | 'sticky' | null) => void

  /**
   * Callback to set selected annotation
   */
  setSelectedAnnotation: (id: string | null) => void

  /**
   * Callback to set page number
   */
  setPageNumber: React.Dispatch<React.SetStateAction<number>>

  /**
   * Callback to set search results
   */
  setSearchResults: (results: SearchResult[]) => void

  /**
   * Callback to set current search index
   */
  setCurrentSearchIndex: (index: number) => void

  /**
   * Callback to set search query
   */
  setSearchQuery: (query: string) => void
}

/**
 * Return type for usePdfHandlers hook
 */
interface UsePdfHandlersReturn {
  /**
   * Handle page click for adding annotations
   */
  handlePageClick: (event: React.MouseEvent<HTMLDivElement>) => void

  /**
   * Delete an annotation
   */
  deleteAnnotation: (id: string) => void

  /**
   * Extract text from current PDF page
   */
  handleExtractText: () => Promise<void>

  /**
   * Navigate to next search result
   */
  handleNextResult: () => void

  /**
   * Navigate to previous search result
   */
  handlePreviousResult: () => void

  /**
   * Clear search
   */
  handleClearSearch: () => void

  /**
   * Clear all annotations
   */
  handleClearAllAnnotations: () => void

  /**
   * Perform PDF search
   */
  handleSearch: () => Promise<void>
}

/**
 * Hook for PDF-specific event handlers
 * 
 * @param props - Hook configuration props
 * @returns PDF event handlers
 */
export function usePdfHandlers({
  pdfUrl,
  pageNumber,
  numPages,
  searchQuery,
  searchResults,
  currentSearchIndex,
  activeTool,
  annotations,
  setPdfLoading,
  setContent,
  setError,
  setAnnotations,
  setActiveTool,
  setSelectedAnnotation,
  setPageNumber,
  setSearchResults,
  setCurrentSearchIndex,
  setSearchQuery,
}: UsePdfHandlersProps): UsePdfHandlersReturn {
  const t = useTranslations('documentEditor')

  /**
   * Handle page click for adding annotations
   */
  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || activeTool === 'select') return

    const pageElement = event.currentTarget.querySelector('.react-pdf__Page')
    if (!pageElement) return

    const pageRect = pageElement.getBoundingClientRect()
    const clickX = event.clientX - pageRect.left
    const clickY = event.clientY - pageRect.top

    // Normalize coordinates (0-1)
    const x = Math.max(0, Math.min(1, clickX / pageRect.width))
    const y = Math.max(0, Math.min(1, clickY / pageRect.height))

    if (activeTool === 'highlight') {
      // Create highlight annotation
      const newAnnotation: PDFAnnotation = {
        id: `annotation-${Date.now()}`,
        page: pageNumber,
        type: 'highlight',
        x: Math.max(0, Math.min(1, x - 0.1)),
        y: Math.max(0, Math.min(1, y - 0.02)),
        width: 0.2,
        height: 0.04,
        color: THEME.COLORS.ANNOTATION.HIGHLIGHT,
        createdAt: new Date().toISOString(),
      }
      setAnnotations((prev) => [...prev, newAnnotation])
      setActiveTool(null)
    } else if (activeTool === 'text' || activeTool === 'sticky') {
      // Create text/sticky note annotation
      const text = prompt(t('enterAnnotationText') || 'Enter annotation text:')
      if (text) {
        const newAnnotation: PDFAnnotation = {
          id: `annotation-${Date.now()}`,
          page: pageNumber,
          type: activeTool,
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y)),
          text: text,
          color: activeTool === 'sticky' ? THEME.COLORS.ANNOTATION.HIGHLIGHT : THEME.COLORS.ANNOTATION.WHITE,
          createdAt: new Date().toISOString(),
        }
        setAnnotations((prev) => [...prev, newAnnotation])
        setActiveTool(null)
      }
    }
  }

  /**
   * Delete an annotation
   */
  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id))
    setSelectedAnnotation(null)
  }

  /**
   * Extract text from current PDF page
   */
  const handleExtractText = async () => {
    if (!pdfUrl) return

    setPdfLoading(true)
    try {
      const loadingTask = pdfjs.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .filter(isTextItem)
        .map((item) => item.str)
        .join(' ')

      setContent((prev) =>
        prev
          ? `${prev}\n\n--- Page ${pageNumber} ---\n${pageText}`
          : `--- Page ${pageNumber} ---\n${pageText}`
      )
    } catch (err) {
      console.error(CONSOLE_MESSAGES.ERROR_EXTRACTING_TEXT, err)
      setError(ERROR_MESSAGES.EXTRACT_TEXT_FAILED)
    } finally {
      setPdfLoading(false)
    }
  }

  /**
   * Perform PDF search
   */
  const handleSearch = async () => {
    if (!pdfUrl || !searchQuery.trim() || !numPages) return

    try {
      setPdfLoading(true)
      const loadingTask = pdfjs.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      const results: SearchResult[] = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .filter(isTextItem)
          .map((item) => item.str)
          .join(' ')

        if (pageText.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ page: i, text: pageText })
        }
      }

      setSearchResults(results)
      if (results.length > 0) {
        setCurrentSearchIndex(0)
        setPageNumber(results[0].page)
      }
    } catch (err) {
      console.error(CONSOLE_MESSAGES.SEARCH_ERROR, err)
      setError(ERROR_MESSAGES.SEARCH_FAILED)
    } finally {
      setPdfLoading(false)
    }
  }

  /**
   * Navigate to next search result
   */
  const handleNextResult = () => {
    if (searchResults.length === 0) return
    const nextIndex =
      currentSearchIndex < searchResults.length - 1
        ? currentSearchIndex + 1
        : 0
    setCurrentSearchIndex(nextIndex)
    setPageNumber(searchResults[nextIndex].page)
  }

  /**
   * Navigate to previous search result
   */
  const handlePreviousResult = () => {
    if (searchResults.length === 0) return
    const prevIndex =
      currentSearchIndex > 0
        ? currentSearchIndex - 1
        : searchResults.length - 1
    setCurrentSearchIndex(prevIndex)
    setPageNumber(searchResults[prevIndex].page)
  }

  /**
   * Clear search
   */
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setCurrentSearchIndex(-1)
  }

  /**
   * Clear all annotations
   */
  const handleClearAllAnnotations = () => {
    if (confirm(t('clearAllAnnotations') || 'Clear all annotations?')) {
      setAnnotations([])
    }
  }

  return {
    handlePageClick,
    deleteAnnotation,
    handleExtractText,
    handleNextResult,
    handlePreviousResult,
    handleClearSearch,
    handleClearAllAnnotations,
    handleSearch,
  }
}

