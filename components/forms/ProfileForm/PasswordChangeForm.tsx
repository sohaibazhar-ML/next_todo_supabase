/**
 * Password Change Form Component
 * 
 * Separate form component for changing user password.
 */

import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { PasswordChangeFormData } from './profileFormSchema'
import { Input, Button, ErrorMessage, SuccessMessage } from '@/components/ui'

export interface PasswordChangeFormProps {
  /**
   * React Hook Form instance for password change
   */
  form: UseFormReturn<PasswordChangeFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Error from password mutation
   */
  error?: Error | null
  
  /**
   * Whether password change was successful
   */
  isSuccess?: boolean
  
  /**
   * Callback when form is submitted
   */
  onSubmit: () => void
  
  /**
   * Callback to close/hide password change form
   */
  onClose?: () => void
}

export default function PasswordChangeForm({
  form,
  isLoading = false,
  error,
  isSuccess,
  onSubmit,
  onClose,
}: PasswordChangeFormProps) {
  const t = useTranslations('profileForm')
  
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : t('passwordUpdateFailed') || 'Failed to update password'
          }
        />
      )}

      {isSuccess && (
        <SuccessMessage
          message={t('passwordUpdated') || 'Password updated successfully'}
        />
      )}

      <div className="space-y-4">
        <Input
          {...register('newPassword')}
          type="password"
          label={t('newPassword')}
          placeholder={t('newPasswordPlaceholder')}
          error={errors.newPassword?.message}
          required
          disabled={isLoading}
        />

        <Input
          {...register('confirmPassword')}
          type="password"
          label={t('confirmPassword')}
          placeholder={t('confirmPasswordPlaceholder')}
          error={errors.confirmPassword?.message}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onClose && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? t('updating') : t('updatePassword')}
        </Button>
      </div>
    </form>
  )
}

