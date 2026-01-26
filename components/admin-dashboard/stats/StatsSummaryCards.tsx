/**
 * Stats Summary Cards Component
 * 
 * Displays summary statistics cards.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Statistics } from '@/services/api/stats'

export interface StatsSummaryCardsProps {
  stats: Statistics
}

export default function StatsSummaryCards({ stats }: StatsSummaryCardsProps) {
  const t = useTranslations('stats')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">{t('totalUsers')}</p>
            <p className="text-3xl font-bold mt-2">{stats.summary.totalUsers}</p>
          </div>
          <svg
            className="w-12 h-12 text-blue-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">{t('totalAdmins')}</p>
            <p className="text-3xl font-bold mt-2">{stats.summary.totalAdmins}</p>
          </div>
          <svg
            className="w-12 h-12 text-purple-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">{t('totalDocuments')}</p>
            <p className="text-3xl font-bold mt-2">{stats.summary.totalDocuments}</p>
          </div>
          <svg
            className="w-12 h-12 text-green-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

