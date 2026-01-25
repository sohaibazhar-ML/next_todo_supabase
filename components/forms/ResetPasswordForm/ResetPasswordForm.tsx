/**
 * Reset Password Form Component
 */

'use client'

import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'
import Link from 'next/link'
import { useResetPasswordForm } from './useResetPasswordForm'
import { ErrorMessage, SuccessMessage } from '@/components/ui'
import { IconSpinner, IconLock } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'

export default function ResetPasswordForm() {
  const t = useTranslations()
  const { form, onSubmit, isLoading, error, message } = useResetPasswordForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        {message && <SuccessMessage message={message || t('resetPassword.passwordReset')} />}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {t('resetPassword.newPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              {...form.register('password')}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                form.formState.errors.password
                  ? 'border-red-300 text-gray-900'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('resetPassword.confirmNewPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                form.formState.errors.confirmPassword
                  ? 'border-red-300 text-gray-900'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <IconSpinner className="h-5 w-5" />}
          {isLoading ? t('common.loading') : t('resetPassword.resetPassword')}
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
