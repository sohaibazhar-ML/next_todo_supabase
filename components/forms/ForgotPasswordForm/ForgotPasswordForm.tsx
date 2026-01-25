/**
 * Forgot Password Form Component
 */

'use client'

import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'
import Link from 'next/link'
import { useForgotPasswordForm } from './useForgotPasswordForm'
import { ErrorMessage, SuccessMessage } from '@/components/ui'
import { IconSpinner } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'

export default function ForgotPasswordForm() {
  const t = useTranslations()
  const { form, onSubmit, isLoading, error, message } = useForgotPasswordForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        {message && <SuccessMessage message={message || t('forgotPassword.emailSent')} />}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('signup.email')}
          </label>
          <input
            id="email"
            type="email"
            {...form.register('email')}
            className={`block w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              form.formState.errors.email
                ? 'border-red-300 text-gray-900'
                : 'border-gray-300 text-gray-900'
            }`}
            placeholder="you@example.com"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <IconSpinner className="h-5 w-5" />}
          {isLoading ? t('common.loading') : t('forgotPassword.sendResetLink')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href={ROUTES.LOGIN} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          ← {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </FormProvider>
  )
}
