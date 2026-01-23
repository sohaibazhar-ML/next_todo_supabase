/**
 * Document Header Component
 * 
 * Displays document title, file icon, and featured badge.
 */

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { getFileIconColor } from '@/lib/utils/file-utils'
import { IconFile } from '@/components/ui/icons'

interface DocumentHeaderProps {
  document: Document
}

export default function DocumentHeader({ document }: DocumentHeaderProps) {
  const t = useTranslations('documentCard')
  const colorClass = getFileIconColor(document.file_type)

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3 flex-1">
        <IconFile className={`h-8 w-8 ${colorClass}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>
          {document.is_featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
              {t('featured')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

