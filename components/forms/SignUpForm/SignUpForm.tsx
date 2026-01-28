/**
 * Sign-Up Form Component
 * 
 * Main form component for user registration.
 * Uses React Hook Form with Zod validation.
 * 
 * @example
 * ```tsx
 * <SignUpForm
 *   onSuccess={() => router.push('/dashboard')}
 * />
 * ```
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSignUpForm } from './useSignUpForm'
import { useSocialAuth } from '@/hooks'
import SignUpFormFields from './SignUpFormFields'
import { ErrorMessage, SuccessMessage } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export interface SignUpFormProps {
  /**
   * Callback when sign-up succeeds
   */
  onSuccess?: () => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const t = useTranslations()
  const router = useRouter()
  
  const { form, onSubmit, isLoading, error, isSuccess } = useSignUpForm({
    onSuccess,
  })
  const { handleGoogleAuth, isLoading: socialLoading, error: googleError, clearError } = useSocialAuth()

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error Messages */}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : t('signup.registrationFailed') || 'Registration failed'
          }
        />
      )}

      {googleError && (
        <ErrorMessage
          message={googleError}
          onDismiss={clearError}
        />
      )}

      {/* Success Message */}
      {isSuccess && (
        <SuccessMessage
          message={t('signup.registrationSuccess') || 'Registration successful! Please check your email for confirmation.'}
        />
      )}

      {/* Form Fields */}
      <SignUpFormFields
        form={form}
        isLoading={isLoading}
        isGoogleLoading={socialLoading === 'google'}
        onGoogleSignUp={handleGoogleAuth}
      />

      {/* Login Link */}
      <div className="mt-6 text-center">
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-indigo-600 hover:underline"
        >
          {t('signup.alreadyHaveAccount')}
        </Link>
      </div>
    </form>
  )
}

