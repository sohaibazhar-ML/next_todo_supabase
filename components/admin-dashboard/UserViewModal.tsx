'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import UserProfileView from '@/components/UserProfileView'
import { THEME } from '@/constants/theme'
import { IconX } from '@/components/ui/icons'

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
            <IconX className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <UserProfileView profile={user} isOwnProfile={false} />
        </div>
      </div>
    </div>
  )
}


