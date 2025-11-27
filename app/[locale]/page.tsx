import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center space-y-6 bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900">{t('auth.welcomeBack')}</h1>
        <p className="text-lg text-gray-600">{t('auth.signInToContinue')}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            {t('common.signIn')}
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            {t('common.signUp')}
          </Link>
        </div>
      </div>
    </div>
  )
}

