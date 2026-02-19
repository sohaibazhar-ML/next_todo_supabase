'use client'

import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import { THEME } from '@/constants/theme'
import { IconBriefcase, IconClipboardList, IconUsersGroup, IconStats } from '@/components/ui/icons'
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
        <IconBriefcase className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} />
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.ACTIVE_TASK,
      value: statistics.activeTasks.total.toString(),
      subtitle: `${statistics.activeTasks.completed} Completed`,
      icon: (
        <IconClipboardList className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} />
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.TEAMS,
      value: statistics.teams.total.toString(),
      subtitle: `${statistics.teams.completed} Completed`,
      icon: (
        <IconUsersGroup className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} />
      ),
    },
    {
      title: ADMIN_DASHBOARD.STATS_CARD_TITLES.PRODUCTIVITY,
      value: `${statistics.productivity.percentage}%`,
      subtitle: `${statistics.productivity.completed}% Completed`,
      icon: (
        <IconStats className={`${ADMIN_DASHBOARD.ICON_SIZE_XL} ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT}`} />
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

