'use client'

import { useTranslations } from 'next-intl'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface AdminDashboardHeaderProps {
  onCreateProject?: () => void
}

export default function AdminDashboardHeader({ onCreateProject }: AdminDashboardHeaderProps) {
  const t = useTranslations('adminDashboard')

  return (
    <div className={`${ADMIN_DASHBOARD.COLOR_PRIMARY_BG} ${ADMIN_DASHBOARD.HEADER_PADDING} rounded-t-lg`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${ADMIN_DASHBOARD.COLOR_WHITE_TEXT}`}>{t('projects')}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onCreateProject}
            className={`px-6 py-2.5 bg-white ${ADMIN_DASHBOARD.COLOR_PRIMARY_TEXT} rounded-lg font-medium hover:bg-gray-100 transition-colors`}
          >
            {t('createNewProject')}
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}

