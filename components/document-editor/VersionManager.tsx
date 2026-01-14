/**
 * Version Manager Component
 * Displays and manages document versions
 */

'use client'

import { useTranslations } from 'next-intl'

interface UserVersion {
  id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: any
  created_at: string
  is_draft: boolean
}

interface VersionManagerProps {
  versions: UserVersion[]
  onLoadVersion: (version: UserVersion) => void
}

export default function VersionManager({ versions, onLoadVersion }: VersionManagerProps) {
  const t = useTranslations('documentEditor')

  if (versions.length === 0) return null

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t('selectVersion')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onLoadVersion(version)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium text-sm text-gray-900">
                {t('version')} {version.version_number}
                {version.version_name && ` - ${version.version_name}`}
              </div>
              <div className="text-xs text-gray-700 mt-1">
                {new Date(version.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

