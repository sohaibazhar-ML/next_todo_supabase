/**
 * Login Form Fields Component
 * 
 * Presentational component for login form fields.
 */

'use client'

import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import type { LoginFormData } from './loginFormSchema'
import { IconUser, IconLock } from '@/components/ui/icons'
import Link from 'next/link'

export default function LoginFormFields() {
  const t = useTranslations()
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginFormData>()

  return (
    <>
      {/* Email/Username Field */}
      <div>
        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.emailOrUsername')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="emailOrUsername"
            type="text"
            autoComplete="username"
            {...register('emailOrUsername')}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm placeholder:text-gray-500 ${
              errors.emailOrUsername
                ? 'border-red-300 text-gray-900'
                : 'border-gray-300 text-gray-900'
            }`}
            placeholder={t('auth.emailOrUsernamePlaceholder')}
          />
        </div>
        {errors.emailOrUsername && (
          <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.password')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm placeholder:text-gray-500 ${
              errors.password
                ? 'border-red-300 text-gray-900'
                : 'border-gray-300 text-gray-900'
            }`}
            placeholder={t('auth.passwordPlaceholder')}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Remember & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            {t('auth.rememberMe')}
          </label>
        </div>

        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </div>
    </>
  )
}
