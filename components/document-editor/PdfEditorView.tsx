/**
 * PDF Editor View
 * 
 * Presentational component for PDF document viewing and annotation.
 * Handles all PDF-specific UI and interactions.
 * 
 * Responsibilities:
 * - Render PDF viewer interface
 * - Handle PDF annotations
 * - Manage PDF navigation and search
 */

'use client'

import PdfViewer from './PdfViewer'
import type { useDocumentEditorState } from './hooks/useDocumentEditorState'
import type { usePdfHandlers } from './hooks/usePdfHandlers'

interface PdfEditorViewProps {
  editorState: ReturnType<typeof useDocumentEditorState>
  workerReady: boolean
  pdfHandlers: ReturnType<typeof usePdfHandlers>
}

export default function PdfEditorView({
  editorState,
  workerReady,
  pdfHandlers,
}: PdfEditorViewProps) {
  return (
    <PdfViewer
      pdfUrl={editorState.pdfUrl}
      numPages={editorState.numPages}
      pageNumber={editorState.pageNumber}
      scale={editorState.scale}
      workerReady={workerReady}
      annotations={editorState.annotations}
      activeTool={editorState.activeTool}
      selectedAnnotation={editorState.selectedAnnotation}
      searchQuery={editorState.searchQuery}
      searchResults={editorState.searchResults}
      currentSearchIndex={editorState.currentSearchIndex}
      pdfLoading={editorState.pdfLoading}
      content={editorState.content}
      pageRefs={editorState.pageRefs}
      onPageChange={editorState.setPageNumber}
      onScaleChange={editorState.setScale}
      onToolChange={editorState.setActiveTool}
      onAnnotationClick={editorState.setSelectedAnnotation}
      onDeleteAnnotation={pdfHandlers.deleteAnnotation}
      onClearAllAnnotations={pdfHandlers.handleClearAllAnnotations}
      onSearchQueryChange={editorState.setSearchQuery}
      onSearch={pdfHandlers.handleSearch}
      onClearSearch={pdfHandlers.handleClearSearch}
      onNextResult={pdfHandlers.handleNextResult}
      onPreviousResult={pdfHandlers.handlePreviousResult}
      onExtractText={pdfHandlers.handleExtractText}
      onContentChange={editorState.setContent}
      onPageClick={pdfHandlers.handlePageClick}
      onNumPagesChange={editorState.setNumPages}
    />
  )
}
