/**
 * PDF Annotation Toolbar Component
 * Contains tools for annotating PDFs
 */

'use client'

import { useTranslations } from 'next-intl'
import { ToolbarButton } from '@/components/ui'

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
        <ToolbarButton
          active={activeTool === 'select'}
          activeColor="indigo"
          onClick={() => onToolChange(activeTool === 'select' ? null : 'select')}
          title={t('selectTool') || 'Select'}
        >
          {t('select') || 'Select'}
        </ToolbarButton>
        <ToolbarButton
          active={activeTool === 'highlight'}
          activeColor="yellow"
          onClick={() => onToolChange(activeTool === 'highlight' ? null : 'highlight')}
          title={t('highlightTool') || 'Highlight'}
        >
          {t('highlight') || 'Highlight'}
        </ToolbarButton>
        <ToolbarButton
          active={activeTool === 'text'}
          activeColor="blue"
          onClick={() => onToolChange(activeTool === 'text' ? null : 'text')}
          title={t('textAnnotation') || 'Text Annotation'}
        >
          {t('textNote') || 'Text'}
        </ToolbarButton>
        <ToolbarButton
          active={activeTool === 'sticky'}
          activeColor="green"
          onClick={() => onToolChange(activeTool === 'sticky' ? null : 'sticky')}
          title={t('stickyNote') || 'Sticky Note'}
        >
          {t('sticky') || 'Sticky'}
        </ToolbarButton>
        {annotationsCount > 0 && (
          <ToolbarButton
            activeColor="red"
            onClick={onClearAll}
            title={t('clearAnnotations') || 'Clear All Annotations'}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            {t('clear') || 'Clear'}
          </ToolbarButton>
        )}
      </div>
    </div>
  )
}

