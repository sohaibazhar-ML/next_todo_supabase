'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import ProfileForm from '@/components/ProfileForm'

interface UserEditModalProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSaved,
}: UserEditModalProps) {
  const t = useTranslations('adminUsers')

  if (!isOpen || !user) {
    return null
  }

  const handleSaved = () => {
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('edit.title')}
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
          <ProfileForm
            initialProfile={user}
            userEmail={user.email}
            userFirstName={user.first_name}
            userLastName={user.last_name}
            userId={user.id}
            onCompleted={handleSaved}
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              {t('edit.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


