/**
 * Profile Form Component
 * 
 * Main form component for creating and editing user profiles.
 * Uses React Hook Form with Zod validation and React Query for data fetching.
 * 
 * @example
 * ```tsx
 * <ProfileForm
 *   userId="123"
 *   isCreating={false}
 *   defaultValues={profile}
 *   onSuccess={() => console.log('Updated!')}
 * />
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useProfileForm } from './useProfileForm'
import ProfileFormFields from './ProfileFormFields'
import PasswordChangeForm from './PasswordChangeForm'
import { ErrorMessage, SuccessMessage, Button } from '@/components/ui'
import UserProfileView from '@/components/UserProfileView'
import type { UserProfile } from '@/types'

/**
 * User info for pre-filling form during creation
 */
export interface UserInfo {
  email: string
  firstName: string
  lastName: string
}

export interface ProfileFormProps {
  /**
   * User ID
   */
  userId: string
  
  /**
   * Initial profile data (null for creation, UserProfile for editing)
   */
  initialProfile: UserProfile | null
  
  /**
   * User info for pre-filling during creation
   */
  userInfo?: UserInfo
  
  /**
   * Callback when profile update/create succeeds
   */
  onSuccess?: () => void
  
  /**
   * Callback when profile update/create is completed (includes navigation)
   */
  onCompleted?: () => void
}

export default function ProfileForm({
  userId,
  initialProfile,
  userInfo,
  onSuccess,
  onCompleted,
}: ProfileFormProps) {
  const t = useTranslations('profileForm')
  const isCreating = initialProfile === null
  
  const [isEditing, setIsEditing] = useState(isCreating)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const effectiveUserInfo = userInfo || {
    email: '',
    firstName: '',
    lastName: '',
  }

  // Shared helper to build the form reset values from a profile
  const getProfileResetValues = (profile: UserProfile) => ({
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    current_address: profile.current_address,
    country_of_origin: profile.country_of_origin,
    new_address_switzerland: profile.new_address_switzerland,
    number_of_adults: profile.number_of_adults,
    number_of_children: profile.number_of_children,
    pets_type: profile.pets_type,
    marketing_consent: profile.marketing_consent,
    terms_accepted: profile.terms_accepted,
    data_privacy_accepted: profile.data_privacy_accepted,
    username: profile.username,
  })

  // Prepare default values
  const defaultValues = initialProfile || {
    first_name: effectiveUserInfo.firstName,
    last_name: effectiveUserInfo.lastName,
    email: effectiveUserInfo.email,
  }

  const {
    form,
    onSubmit,
    isLoading,
    error,
    isSuccess,
    passwordForm,
    onPasswordSubmit,
    isPasswordLoading,
    passwordError,
    isPasswordSuccess,
  } = useProfileForm({
    userId,
    isCreating,
    onSuccess: () => {
      if (isCreating) {
        onCompleted?.()
      } else {
        setIsEditing(false)
        onSuccess?.()
      }
    },
    defaultValues,
  })

  // Reset form when initialProfile changes
  useEffect(() => {
    if (initialProfile && !isCreating) {
      form.reset(getProfileResetValues(initialProfile))
    }
  }, [initialProfile?.id, form, isCreating])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (initialProfile) {
      form.reset(getProfileResetValues(initialProfile))
    }
    setIsEditing(false)
  }

  // View mode (read-only display)
  if (!isEditing && !isCreating && initialProfile) {
    return (
      <div className="space-y-8">
        {/* Success Message */}
        {isSuccess && (
          <SuccessMessage message={t('profileUpdated') || 'Profile updated successfully'} />
        )}

        <UserProfileView
          profile={initialProfile}
          isOwnProfile={true}
          onEdit={handleEdit}
        />

        {/* Password Change Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('changePassword')}</h3>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              {showPasswordChange ? t('hidePasswordChange') : t('changePassword')}
            </Button>
          </div>
          {showPasswordChange && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <PasswordChangeForm
                form={passwordForm}
                isLoading={isPasswordLoading}
                error={passwordError}
                isSuccess={isPasswordSuccess}
                onSubmit={onPasswordSubmit}
                onClose={() => setShowPasswordChange(false)}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Edit/Create mode (form)
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : t('updateFailed') || 'Update failed'
          }
        />
      )}

      {/* Success Message */}
      {isSuccess && (
        <SuccessMessage
          message={
            isCreating
              ? t('profileCreated') || 'Profile created successfully'
              : t('profileUpdated') || 'Profile updated successfully'
          }
        />
      )}

      {/* Form Fields */}
      <ProfileFormFields
        form={form}
        isLoading={isLoading}
        isCreating={isCreating}
        onCancel={!isCreating ? handleCancel : undefined}
      />
    </form>
  )
}

