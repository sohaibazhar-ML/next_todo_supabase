'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { SignUpForm } from '@/components/forms/SignUpForm'
import { ROUTES } from '@/constants/routes'

export default function SignUpPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t('signup.createAccount')}</h2>
          <p className="text-white/90 drop-shadow-md">{t('signup.fillAllInfo')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignUpForm />

          <div className="mt-6 text-center">
            <Link href={ROUTES.LOGIN} className="text-sm text-indigo-600 hover:underline">
              {t('signup.alreadyHaveAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

