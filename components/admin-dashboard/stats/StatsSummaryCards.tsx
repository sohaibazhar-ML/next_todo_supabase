/**
 * Stats Summary Cards Component
 * 
 * Displays summary statistics cards.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Statistics } from '@/services/api/stats'
import { IconUsers, IconShieldCheck, IconDocuments } from '@/components/ui/icons'
import StatsCard from './StatsCard'

export interface StatsSummaryCardsProps {
  stats: Statistics
}

export default function StatsSummaryCards({ stats }: StatsSummaryCardsProps) {
  const t = useTranslations('stats')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title={t('totalUsers')}
        value={stats.summary.totalUsers}
        icon={IconUsers}
        variant="blue"
      />

      <StatsCard
        title={t('totalAdmins')}
        value={stats.summary.totalAdmins}
        icon={IconShieldCheck}
        variant="purple"
      />

      <StatsCard
        title={t('totalDocuments')}
        value={stats.summary.totalDocuments}
        icon={IconDocuments}
        variant="green"
      />
    </div>
  )
}

