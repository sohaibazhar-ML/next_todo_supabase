/**
 * Stats Versions Tab Component
 * 
 * Displays version downloads in a tab.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Statistics } from '@/services/api/stats'

export interface StatsVersionsTabProps {
  stats: Statistics
}

export default function StatsVersionsTab({ stats }: StatsVersionsTabProps) {
  const t = useTranslations('stats')

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('versionDownloads')}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('document')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('version')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('fileSize')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('createdAt')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.versionDownloads.slice(0, 50).map((version) => (
              <tr key={version.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {version.document_title}
                  </div>
                  <div className="text-sm text-gray-500">{version.document_file_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {t('version')} {version.version_number}
                  {version.version_name && ` - ${version.version_name}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {version.exported_file_size
                    ? `${(parseInt(version.exported_file_size) / 1024).toFixed(2)} KB`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(version.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

