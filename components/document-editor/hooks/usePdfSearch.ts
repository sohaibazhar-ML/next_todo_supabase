/**
 * Hook for PDF search functionality
 */

import { useState } from 'react'
import { pdfjs } from 'react-pdf'

interface SearchResult {
  page: number
  text: string
}

interface UsePdfSearchProps {
  pdfUrl: string | null
  numPages: number | null
}

export function usePdfSearch({ pdfUrl, numPages }: UsePdfSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!pdfUrl || !searchQuery.trim() || !numPages) return
    
    try {
      setSearching(true)
      const loadingTask = pdfjs.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      const results: SearchResult[] = []
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        
        if (pageText.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ page: i, text: pageText })
        }
      }
      
      setSearchResults(results)
      if (results.length > 0) {
        setCurrentSearchIndex(0)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setCurrentSearchIndex(-1)
  }

  const goToNextResult = () => {
    if (searchResults.length === 0) return
    const nextIndex = currentSearchIndex < searchResults.length - 1 
      ? currentSearchIndex + 1 
      : 0
    setCurrentSearchIndex(nextIndex)
    return searchResults[nextIndex]?.page
  }

  const goToPreviousResult = () => {
    if (searchResults.length === 0) return
    const prevIndex = currentSearchIndex > 0 
      ? currentSearchIndex - 1 
      : searchResults.length - 1
    setCurrentSearchIndex(prevIndex)
    return searchResults[prevIndex]?.page
  }

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    currentSearchIndex,
    searching,
    handleSearch,
    clearSearch,
    goToNextResult,
    goToPreviousResult,
  }
}

