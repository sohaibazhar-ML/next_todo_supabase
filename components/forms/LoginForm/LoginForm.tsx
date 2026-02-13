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

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'
import { useLoginForm } from './useLoginForm'
import { useSocialAuth } from '@/hooks'
import LoginFormFields from './LoginFormFields'
import { ErrorMessage, Button } from '@/components/ui'
import { IconGoogle } from '@/components/ui/icons'
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
  
  const { form, onSubmit, isLoading, error } = useLoginForm({ onSuccess })
  const { handleGoogleAuth, isLoading: socialLoading, error: googleError } = useSocialAuth()

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
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            loading={socialLoading === 'google'}
            disabled={isLoading || socialLoading !== null}
            onClick={handleGoogleAuth}
            icon={<IconGoogle className="h-5 w-5" />}
            className="shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {socialLoading === 'google' ? t('auth.signingInWithGoogle') : t('auth.continueWithGoogle')}
          </Button>
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
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading || socialLoading !== null}
            className="transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? t('auth.signingIn') : t('common.signIn')}
          </Button>
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
