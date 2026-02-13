'use client'

import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/forms/ProfileForm'
import type { UserProfile } from '@/types'
import type { UserInfo } from '@/components/forms/ProfileForm/ProfileForm'

interface ProfilePageClientProps {
  userId: string
  initialProfile: UserProfile | null
  userInfo?: UserInfo
}

export default function ProfilePageClient({
  userId,
  initialProfile,
  userInfo,
}: ProfilePageClientProps) {
  const router = useRouter()

  const handleCompleted = () => {
    // Redirect to dashboard after successful profile creation
    router.push('/dashboard')
    router.refresh()
  }

  const handleSuccess = () => {
    // For updates, we might just want to refresh the current page data
    router.refresh()
  }

  return (
    <ProfileForm
      userId={userId}
      initialProfile={initialProfile}
      userInfo={userInfo}
      onCompleted={handleCompleted}
      onSuccess={handleSuccess}
    />
  )
}
