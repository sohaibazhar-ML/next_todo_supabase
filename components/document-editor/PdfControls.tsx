/**
 * PDF Viewer Controls Component
 * Contains page navigation, zoom controls, text extraction, and search
 */

'use client'

import { useTranslations } from 'next-intl'
import { DEFAULT_VALUES } from '@/constants'

interface PdfControlsProps {
  pageNumber: number
  numPages: number | null
  scale: number
  pdfUrl: string | null
  pdfLoading: boolean
  searchQuery: string
  searchResults: Array<{ page: number; text: string }>
  currentSearchIndex: number
  onPageChange: (page: number) => void
  onScaleChange: (scale: number) => void
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onClearSearch: () => void
  onNextResult: () => void
  onPreviousResult: () => void
  onExtractText: () => void
}

export default function PdfControls({
  pageNumber,
  numPages,
  scale,
  pdfUrl,
  pdfLoading,
  searchQuery,
  searchResults,
  currentSearchIndex,
  onPageChange,
  onScaleChange,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
  onNextResult,
  onPreviousResult,
  onExtractText,
}: PdfControlsProps) {
  const t = useTranslations('documentEditor')

  return (
    <div className="border-b border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {t('previous') || 'Previous'}
          </button>
          <span className="text-sm text-gray-700">
            {t('page') || 'Page'} {pageNumber} {numPages !== null && `of ${numPages}`}
          </span>
          <input
            type="number"
            min="1"
            max={numPages || 1}
            value={pageNumber}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= (numPages || 1)) {
                onPageChange(page)
              }
            }}
            className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900"
          />
          <button
            onClick={() => onPageChange(Math.min(numPages || 1, pageNumber + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('next') || 'Next'} →
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-sm text-gray-700 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onScaleChange(Math.min(2.0, scale + 0.25))}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => onScaleChange(DEFAULT_VALUES.PDF_SCALE)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Reset Zoom"
          >
            {t('reset') || 'Reset'}
          </button>
        </div>

        {/* Extract Text Button */}
        <button
          onClick={onExtractText}
          disabled={pdfLoading || !pdfUrl}
          className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfLoading ? t('extracting') || 'Extracting...' : t('extractText') || 'Extract Text'}
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder={t('searchInPdf') || 'Search in PDF...'}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              onSearch()
            }
          }}
        />
        <button
          onClick={onSearch}
          disabled={!searchQuery.trim()}
          className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('search') || 'Search'}
        </button>
        {searchResults.length > 0 && (
          <span className="text-sm text-gray-600">
            {t('found') || 'Found'} {searchResults.length} {t('results') || 'results'}
            {currentSearchIndex >= 0 && ` (${currentSearchIndex + 1}/${searchResults.length})`}
          </span>
        )}
        {searchResults.length > 0 && (
          <>
            <button
              onClick={onPreviousResult}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ↑
            </button>
            <button
              onClick={onNextResult}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ↓
            </button>
            <button
              onClick={onClearSearch}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}

