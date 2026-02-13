'use client'

import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import { THEME } from '@/constants/theme'
import type { DashboardStatistics } from '@/types/admin-dashboard'

interface StatisticsCardsProps {
  statistics: DashboardStatistics
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.PROJECTS,
      value: statistics.projects.total.toString(),
      subtitle: `${statistics.projects.completed} Completed`,
      icon: (
        <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.ACTIVE_TASK,
      value: statistics.activeTasks.total.toString(),
      subtitle: `${statistics.activeTasks.completed} Completed`,
      icon: (
        <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.TEAMS,
      value: statistics.teams.total.toString(),
      subtitle: `${statistics.teams.completed} Completed`,
      icon: (
        <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.PRODUCTIVITY,
      value: `${statistics.productivity.percentage}%`,
      subtitle: `${statistics.productivity.completed}% Completed`,
      icon: (
        <svg className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className={`grid ${ADMIN_DASHBOARD.STATS_GRID_CLASSES} ${ADMIN_DASHBOARD.STATS_CARDS_GAP} ${ADMIN_DASHBOARD.STATS_CARDS_PADDING}`}>
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">{card.icon}</div>
          <div className={`relative ${THEME.Z_INDEX.DEFAULT}`}>
            <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-gray-500 text-sm">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

