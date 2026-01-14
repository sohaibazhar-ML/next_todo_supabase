/**
 * PDF Annotation Toolbar Component
 * Contains tools for annotating PDFs
 */

'use client'

import { useTranslations } from 'next-intl'

interface PdfToolbarProps {
  activeTool: 'select' | 'highlight' | 'text' | 'sticky' | null
  onToolChange: (tool: 'select' | 'highlight' | 'text' | 'sticky' | null) => void
  annotationsCount: number
  onClearAll: () => void
}

export default function PdfToolbar({
  activeTool,
  onToolChange,
  annotationsCount,
  onClearAll,
}: PdfToolbarProps) {
  const t = useTranslations('documentEditor')

  return (
    <div className="border-b border-gray-200 p-3 bg-indigo-50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-2">{t('annotationTools') || 'Tools:'}</span>
        <button
          onClick={() => onToolChange(activeTool === 'select' ? null : 'select')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTool === 'select' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title={t('selectTool') || 'Select'}
        >
          {t('select') || 'Select'}
        </button>
        <button
          onClick={() => onToolChange(activeTool === 'highlight' ? null : 'highlight')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTool === 'highlight' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title={t('highlightTool') || 'Highlight'}
        >
          {t('highlight') || 'Highlight'}
        </button>
        <button
          onClick={() => onToolChange(activeTool === 'text' ? null : 'text')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTool === 'text' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title={t('textAnnotation') || 'Text Annotation'}
        >
          {t('textNote') || 'Text'}
        </button>
        <button
          onClick={() => onToolChange(activeTool === 'sticky' ? null : 'sticky')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTool === 'sticky' 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title={t('stickyNote') || 'Sticky Note'}
        >
          {t('sticky') || 'Sticky'}
        </button>
        {annotationsCount > 0 && (
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
            title={t('clearAnnotations') || 'Clear All Annotations'}
          >
            {t('clear') || 'Clear'}
          </button>
        )}
      </div>
    </div>
  )
}

