/**
 * PDF Viewer Component
 * Main component for viewing and annotating PDFs
 */

'use client'

import { useTranslations } from 'next-intl'
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf'
import PdfToolbar from './PdfToolbar'
import PdfControls from './PdfControls'
import PdfAnnotationOverlay, { PDFAnnotation } from './PdfAnnotationOverlay'
import LoadingSpinner from '../ui/LoadingSpinner'

interface PdfViewerProps {
  pdfUrl: string | null
  numPages: number | null
  pageNumber: number
  scale: number
  workerReady: boolean
  annotations: PDFAnnotation[]
  activeTool: 'select' | 'highlight' | 'text' | 'sticky' | null
  selectedAnnotation: string | null
  searchQuery: string
  searchResults: Array<{ page: number; text: string }>
  currentSearchIndex: number
  pdfLoading: boolean
  content: string
  pageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  onPageChange: (page: number) => void
  onScaleChange: (scale: number) => void
  onToolChange: (tool: 'select' | 'highlight' | 'text' | 'sticky' | null) => void
  onAnnotationClick: (id: string) => void
  onDeleteAnnotation: (id: string) => void
  onClearAllAnnotations: () => void
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onClearSearch: () => void
  onNextResult: () => void
  onPreviousResult: () => void
  onExtractText: () => void
  onContentChange: (content: string) => void
  onPageClick: (event: React.MouseEvent<HTMLDivElement>) => void
  onNumPagesChange: (numPages: number) => void
}

export default function PdfViewer({
  pdfUrl,
  numPages,
  pageNumber,
  scale,
  workerReady,
  annotations,
  activeTool,
  selectedAnnotation,
  searchQuery,
  searchResults,
  currentSearchIndex,
  pdfLoading,
  content,
  pageRefs,
  onPageChange,
  onScaleChange,
  onToolChange,
  onAnnotationClick,
  onDeleteAnnotation,
  onClearAllAnnotations,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
  onNextResult,
  onPreviousResult,
  onExtractText,
  onContentChange,
  onPageClick,
  onNumPagesChange,
}: PdfViewerProps) {
  const t = useTranslations('documentEditor')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <PdfToolbar
        activeTool={activeTool}
        onToolChange={onToolChange}
        annotationsCount={annotations.length}
        onClearAll={onClearAllAnnotations}
      />

      <PdfControls
        pageNumber={pageNumber}
        numPages={numPages}
        scale={scale}
        pdfUrl={pdfUrl}
        pdfLoading={pdfLoading}
        searchQuery={searchQuery}
        searchResults={searchResults}
        currentSearchIndex={currentSearchIndex}
        onPageChange={onPageChange}
        onScaleChange={onScaleChange}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        onClearSearch={onClearSearch}
        onNextResult={onNextResult}
        onPreviousResult={onPreviousResult}
        onExtractText={onExtractText}
      />

      {/* PDF Viewer */}
      <div className="p-4 bg-gray-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '600px' }}>
        {pdfUrl && workerReady ? (
              <div className="flex justify-center">
            <div 
              className="relative"
              onClick={onPageClick}
              ref={(el) => {
                if (el) pageRefs.current.set(pageNumber, el)
              }}
            >
              <PDFDocument
                file={pdfUrl}
                loading={<LoadingSpinner text={t('loading')} />}
                onLoadSuccess={({ numPages }) => {
                  onNumPagesChange(numPages)
                }}
                onLoadError={(error) => {
                  console.error('PDF load error:', error)
                }}
                error={
                  <div className="p-8 text-center">
                    <p className="text-red-600">{t('pdfLoadError') || 'Failed to load PDF'}</p>
                  </div>
                }
              >
                <div className="relative">
                  <PDFPage
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                  <PdfAnnotationOverlay
                    annotations={annotations}
                    pageNumber={pageNumber}
                    pageRef={pageRefs.current.get(pageNumber) || null}
                    selectedAnnotation={selectedAnnotation}
                    onAnnotationClick={onAnnotationClick}
                    onDeleteAnnotation={onDeleteAnnotation}
                  />
                </div>
              </PDFDocument>
            </div>
          </div>
        ) : pdfUrl && !workerReady ? (
          <LoadingSpinner text={t('loadingWorker') || 'Loading PDF worker...'} />
        ) : (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-600">{t('noPdfUrl') || 'PDF URL not available'}</p>
          </div>
        )}
      </div>

      {/* Text Editor for Notes and Extracted Text */}
      <div className="border-t border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('notesAndExtractedText') || 'Notes and Extracted Text'}
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-500 bg-white"
          placeholder={t('pdfEditorPlaceholder')}
        />
      </div>
    </div>
  )
}

