'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import { ProfileForm } from '@/components/forms/ProfileForm'
import Modal from '@/components/ui/Modal'

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

  if (!user) {
    return null
  }

  const handleSuccess = () => {
    onSaved()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('edit.title')}
      maxWidth="xl"
      contentClassName="p-6"
    >
      <ProfileForm
        userId={user.id}
        initialProfile={user}
        userInfo={{
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        }}
        onSuccess={handleSuccess}
      />
    </Modal>
  )
}


