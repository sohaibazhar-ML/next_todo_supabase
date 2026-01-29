'use client'

import { useTranslations, useLocale } from 'next-intl'
import type { UserProfile } from '@/types/user'
import { IconCheck, IconX } from '@/components/ui/icons'

interface UserProfileViewProps {
  profile: UserProfile
  isOwnProfile: boolean
  onEdit?: () => void
}

export default function UserProfileView({ profile, isOwnProfile, onEdit }: UserProfileViewProps) {
  const t = useTranslations('userProfileView')
  const locale = useLocale()

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('personalInfo')}</h3>
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('edit') || 'Edit'} 
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('username')}</p>
            <p className="text-base text-gray-900">{profile.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('email')}</p>
            <p className="text-base text-gray-900">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('firstName')}</p>
            <p className="text-base text-gray-900">{profile.first_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('lastName')}</p>
            <p className="text-base text-gray-900">{profile.last_name}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 mb-1">{t('phoneNumber')}</p>
            <p className="text-base text-gray-900">{profile.phone_number}</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('addressInfo')}</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('currentAddress')}</p>
            <p className="text-base text-gray-900 whitespace-pre-line">{profile.current_address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('countryOfOrigin')}</p>
            <p className="text-base text-gray-900">{profile.country_of_origin}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('newAddressSwitzerland')}</p>
            <p className="text-base text-gray-900 whitespace-pre-line">{profile.new_address_switzerland}</p>
          </div>
        </div>
      </div>

      {/* Family Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('familyInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('numberOfAdults')}</p>
            <p className="text-base text-gray-900">{profile.number_of_adults}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('numberOfChildren')}</p>
            <p className="text-base text-gray-900">{profile.number_of_children}</p>
          </div>
          {profile.pets_type && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-1">{t('petsType')}</p>
              <p className="text-base text-gray-900">{profile.pets_type}</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('role')}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile.role}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('emailConfirmed')}</p>
            <span className={`inline-flex items-center gap-1 ${
              profile.email_confirmed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {profile.email_confirmed ? (
                <>
                  <IconCheck className="w-5 h-5" />
                  {t('yes')}
                </>
              ) : (
                <>
                  <IconX className="w-5 h-5" />
                  {t('no')}
                </>
              )}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('marketingConsent')}</p>
            <p className="text-base text-gray-900">
              {profile.marketing_consent ? (
                <span className="text-green-600">{t('yes')}</span>
              ) : (
                <span className="text-gray-500">{t('no')}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('accountCreated')}</p>
            <p className="text-base text-gray-900">
              {new Date(profile.created_at).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

