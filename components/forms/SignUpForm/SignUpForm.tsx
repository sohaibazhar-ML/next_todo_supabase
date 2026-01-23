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

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useSignUpForm } from './useSignUpForm'
import SignUpFormFields from './SignUpFormFields'
import { ErrorMessage, SuccessMessage } from '@/components/ui'

export interface SignUpFormProps {
  /**
   * Callback when sign-up succeeds
   */
  onSuccess?: () => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const { form, onSubmit, isLoading, error, isSuccess } = useSignUpForm({
    onSuccess,
  })

  const handleGoogleSignUp = async () => {
    setSocialLoading('google')
    setGoogleError(null)
    
    try {
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (socialError) {
        setGoogleError(socialError.message)
        setSocialLoading(null)
      }
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : 'Failed to sign up with Google'
      )
      setSocialLoading(null)
    }
  }

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
          onDismiss={() => setGoogleError(null)}
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
        onGoogleSignUp={handleGoogleSignUp}
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

