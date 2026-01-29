/**
 * Stats Card Component
 * 
 * Reusable card component for displaying dashboard statistics.
 * Supports different color variants for visual distinction.
 */

import { ElementType } from 'react'
import { IconProps } from '@/components/ui/icons/IconDashboard'

export type StatsCardVariant = 'blue' | 'purple' | 'green'

export interface StatsCardProps {
  title: string
  value: number | string
  icon: ElementType<IconProps>
  variant: StatsCardVariant
}

const VARIANTS = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-100',
    icon: 'text-blue-200',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    text: 'text-purple-100',
    icon: 'text-purple-200',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500 to-green-600',
    text: 'text-green-100',
    icon: 'text-green-200',
  },
}

export default function StatsCard({ title, value, icon: Icon, variant }: StatsCardProps) {
  const styles = VARIANTS[variant]

  return (
    <div className={`${styles.bg} rounded-lg p-6 text-white shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${styles.text} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${styles.icon}`} />
      </div>
    </div>
  )
}
