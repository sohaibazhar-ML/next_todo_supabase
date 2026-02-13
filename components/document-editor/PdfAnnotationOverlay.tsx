/**
 * PDF Annotation Overlay Component
 * Renders annotations on top of PDF pages
 */

'use client'

import { useTranslations } from 'next-intl'
import type { PDFAnnotation } from '@/types/documentEditor'
import { UI_TEXT } from '@/constants/text'
import { THEME } from '@/constants/theme'

interface PdfAnnotationOverlayProps {
  annotations: PDFAnnotation[]
  pageNumber: number
  pageRef: HTMLDivElement | null
  selectedAnnotation: string | null
  onAnnotationClick: (id: string) => void
  onDeleteAnnotation: (id: string) => void
}

export default function PdfAnnotationOverlay({
  annotations,
  pageNumber,
  pageRef,
  selectedAnnotation,
  onAnnotationClick,
  onDeleteAnnotation,
}: PdfAnnotationOverlayProps) {
  const t = useTranslations('documentEditor')

  const pageAnnotations = annotations.filter(ann => ann.page === pageNumber)
  if (pageAnnotations.length === 0) return null

  const pageElement = pageRef?.querySelector('.react-pdf__Page')
  if (!pageElement) return null

  const rect = pageElement.getBoundingClientRect()

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pageAnnotations.map(annotation => {
        const left = annotation.x * rect.width
        const top = annotation.y * rect.height
        
        return (
          <div
            key={annotation.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: annotation.width ? `${annotation.width * rect.width}px` : 'auto',
              height: annotation.height ? `${annotation.height * rect.height}px` : 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onAnnotationClick(annotation.id)
            }}
          >
            {annotation.type === 'highlight' && (
              <div
                className="absolute opacity-30 rounded"
                style={{
                  backgroundColor: annotation.color || THEME.COLORS.ANNOTATION.HIGHLIGHT,
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
            {(annotation.type === 'text' || annotation.type === 'sticky') && (
              <div
                className="absolute p-2 rounded shadow-lg border-2 border-gray-400 min-w-[150px] max-w-[250px]"
                style={{
                  backgroundColor: annotation.color || THEME.COLORS.ANNOTATION.WHITE,
                  zIndex: selectedAnnotation === annotation.id ? 1000 : 100,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-800 break-words">{annotation.text}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteAnnotation(annotation.id)
                    }}
                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                    title={t('delete') || UI_TEXT.BUTTONS.DELETE}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

