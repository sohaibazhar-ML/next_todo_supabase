'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { IconSpinner } from '@/components/ui/icons'

export default function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the current locale in the path with the new one
      const pathWithoutLocale = pathname.replace(`/${locale}`, '')
      const newPath = `/${newLocale}${pathWithoutLocale || ''}`
      router.push(newPath)
    })
  }

  const getLanguageIcon = (loc: string) => {
    const icons: Record<string, string> = {
      en: '🇬🇧',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
    }
    return icons[loc] || '🌐'
  }

  return (
    <div className="relative">
      <div className="relative">
        <select
          value={locale}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending}
          className="appearance-none w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('selectLanguage')}
        >
          {routing.locales.map((loc) => (
            <option key={loc} value={loc}>
              {getLanguageIcon(loc)} {t(loc)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isPending ? (
            <IconSpinner className="h-4 w-4 text-indigo-600" />
          ) : (
            <svg
              className="h-4 w-4 text-gray-500 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>
      {isPending && (
        <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600">
          <IconSpinner className="h-3 w-3" />
          <span>Changing language...</span>
        </div>
      )}
    </div>
  )
}

