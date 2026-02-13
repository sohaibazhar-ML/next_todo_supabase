'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import UserProfileView from '@/components/UserProfileView'
import { THEME } from '@/constants/theme'

interface UserViewModalProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
}

export default function UserViewModal({ user, isOpen, onClose }: UserViewModalProps) {
  const t = useTranslations('adminUsers')

  if (!isOpen || !user) {
    return null
  }

  return (
    <div className={`fixed inset-0 ${THEME.Z_INDEX.MODAL} flex items-center justify-center bg-black bg-opacity-50 p-4`}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('details.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <UserProfileView profile={user} isOwnProfile={false} />
        </div>
      </div>
    </div>
  )
}


