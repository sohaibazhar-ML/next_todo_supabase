/**
 * Login Form Component
 * 
 * Main form component for user login.
 * Uses React Hook Form with Zod validation.
 * 
 * @example
 * ```tsx
 * <LoginForm
 *   onSuccess={() => router.push('/dashboard')}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useLoginForm } from './useLoginForm'
import LoginFormFields from './LoginFormFields'
import { ErrorMessage } from '@/components/ui'
import { IconGoogle, IconSpinner } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'

export interface LoginFormProps {
  /**
   * Callback when login succeeds
   */
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const { form, onSubmit, isLoading, error } = useLoginForm({ onSuccess })

  const handleGoogleLogin = async () => {
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
        err instanceof Error ? err.message : 'Failed to sign in with Google'
      )
      setSocialLoading(null)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error Messages */}
        {(error || googleError) && (
          <ErrorMessage
            message={
              error || googleError || t('auth.loginFailed') || 'Login failed'
            }
          />
        )}

        {/* Social Login */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || socialLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {socialLoading === 'google' ? (
              <>
                <IconSpinner className="h-5 w-5 text-gray-400" />
                {t('auth.signingInWithGoogle')}
              </>
            ) : (
              <>
                <IconGoogle className="h-5 w-5" />
                {t('auth.continueWithGoogle')}
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWithEmail')}</span>
          </div>
        </div>

        {/* Form Fields */}
        <LoginFormFields />

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || socialLoading !== null}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <IconSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                {t('auth.signingIn')}
              </>
            ) : (
              t('common.signIn')
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.newToPlatform')}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={ROUTES.SIGNUP}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            {t('auth.createAccount')}
          </Link>
        </div>
      </div>
    </FormProvider>
  )
}
