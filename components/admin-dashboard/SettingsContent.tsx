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
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <nav className={`-mb-px flex ${ADMIN_DASHBOARD.SETTINGS_TABS_SPACING} px-6`}>
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
      <div className="bg-white rounded-b-xl shadow-sm">
        {activeTab === 'profile' && (
          <div className="p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('editProfile')}</h2>
              <p className="text-gray-600 text-sm mb-6">{t('editProfileDescription')}</p>
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl p-6 border border-gray-100">
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
          <div className="p-6">
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <IconLanguage className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('changeLanguage')}</h2>
                  <p className="text-gray-600 text-sm">{t('changeLanguageDescription')}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50/30 rounded-xl p-8 border border-indigo-100">
                <div className="max-w-md">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    {t('selectLanguage')}
                  </label>
                  <LanguageSwitcher />
                  <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-gray-700">
                        {t('languageNote')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

