'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ADMIN_DASHBOARD } from '@/constants/adminDashboard'
import { ProfileForm } from '@/components/forms/ProfileForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { IconSettings, IconLanguage } from '@/components/ui/icons'
import type { UserProfile } from '@/types/user'

interface SettingsContentProps {
  profile: UserProfile
}

export default function SettingsContent({ profile }: SettingsContentProps) {
  const t = useTranslations('settings')
  const [activeTab, setActiveTab] = useState<'profile' | 'language'>(ADMIN_DASHBOARD.DEFAULT_SETTINGS_TAB)

  return (
    <div className={ADMIN_DASHBOARD.SETTINGS_SPACING}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className={`-mb-px flex ${ADMIN_DASHBOARD.SETTINGS_TABS_SPACING}`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? `${ADMIN_DASHBOARD.COLOR_ACTIVE_TAB_BORDER} ${ADMIN_DASHBOARD.COLOR_ACTIVE_TAB_TEXT}`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IconSettings className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />
              {t('editProfile')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'language'
                ? `${ADMIN_DASHBOARD.COLOR_ACTIVE_TAB_BORDER} ${ADMIN_DASHBOARD.COLOR_ACTIVE_TAB_TEXT}`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IconLanguage className={ADMIN_DASHBOARD.ICON_SIZE_MEDIUM} />
              {t('changeLanguage')}
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === 'profile' && (
          <div className={ADMIN_DASHBOARD.SETTINGS_SPACING}>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('editProfile')}</h2>
              <p className="text-gray-600 text-sm mb-6">{t('editProfileDescription')}</p>
              <div className="bg-gray-50 rounded-lg p-6">
                <ProfileForm
                  userId={profile.id}
                  initialProfile={profile}
                  userInfo={{
                    email: profile.email,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'language' && (
          <div className={ADMIN_DASHBOARD.SETTINGS_SPACING}>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('changeLanguage')}</h2>
              <p className="text-gray-600 text-sm mb-6">{t('changeLanguageDescription')}</p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('selectLanguage')}
                  </label>
                  <LanguageSwitcher />
                  <p className="mt-4 text-sm text-gray-500">
                    {t('languageNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

