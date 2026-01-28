/**
 * Document Editor Header Component
 * Contains title, navigation, version management, export, and save buttons
 */

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DOCUMENT_TYPES } from '@/constants'
import { THEME } from '@/constants/theme'
import type { DocumentType, UserVersion } from '@/types/documentEditor'

interface DocumentHeaderProps {
  document: {
    id: string
    title: string
    file_type: string
  }
  documentType: DocumentType
  versions: UserVersion[]
  showVersions: boolean
  onToggleVersions: () => void
  onExport: (format: 'docx' | 'pdf') => void
  onSave: () => void
  saving: boolean
  exporting: boolean
  versionName: string
  onVersionNameChange: (name: string) => void
  onClose?: () => void
}

export default function DocumentHeader({
  document,
  documentType,
  versions,
  showVersions,
  onToggleVersions,
  onExport,
  onSave,
  saving,
  exporting,
  versionName,
  onVersionNameChange,
  onClose,
}: DocumentHeaderProps) {
  const t = useTranslations('documentEditor')
  const router = useRouter()

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 ${THEME.Z_INDEX.DEFAULT}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose || (() => router.back())}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
              <p className="text-sm text-gray-500">{document.file_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {versions.length > 0 && (
              <button
                onClick={onToggleVersions}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                {t('myVersions')} ({versions.length})
              </button>
            )}
            {documentType === DOCUMENT_TYPES.DOCX && (
              <button
                onClick={() => onExport('docx')}
                disabled={exporting || versions.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={versions.length === 0 ? t('noVersionToExport') || 'Please save first' : ''}
              >
                {exporting ? t('exporting') : t('exportDocx')}
              </button>
            )}
            {documentType === DOCUMENT_TYPES.PDF && (
              <button
                onClick={() => onExport('pdf')}
                disabled={exporting || versions.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={versions.length === 0 ? t('noVersionToExport') || 'Please save first' : ''}
              >
                {exporting ? t('exporting') : t('exportPdf')}
              </button>
            )}
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>

        {/* Version name input */}
        <div className="mt-4">
          <input
            type="text"
            value={versionName}
            onChange={(e) => onVersionNameChange(e.target.value)}
            placeholder={t('versionNamePlaceholder')}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500"
          />
        </div>
      </div>
    </div>
  )
}

