/**
 * Stats Downloads Tab Component
 * 
 * Displays user document downloads in a tab.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Statistics } from '@/services/api/stats'

export interface StatsDownloadsTabProps {
  stats: Statistics
}

export default function StatsDownloadsTab({ stats }: StatsDownloadsTabProps) {
  const t = useTranslations('stats')

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('userDocumentDownloads')}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('document')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('downloadedAt')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.userDocumentDownloads.slice(0, 50).map((download) => (
              <tr key={download.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{download.user_name}</div>
                  <div className="text-sm text-gray-500">{download.user_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{download.document_title}</div>
                  <div className="text-sm text-gray-500">{download.document_file_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {download.document_category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {download.downloaded_at
                    ? new Date(download.downloaded_at).toLocaleString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

