'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import { IconLock } from '@/components/ui/icons'

export default function ResetPasswordPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mb-4 border border-white/30">
            <IconLock className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t('resetPassword.title')}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}

