"use client";

import React, { useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Image, Text, Button } from '@/website/atoms';
import { useToggle } from '@/app/_hooks/website/useToggle';
import { updateLanguageAction } from '@/app/_actions/website/settings.actions';
import { updateProfileField } from '@/app/_actions/website/profile.actions';
import { useLoading } from '@/lib/providers/LoadingProvider';

export interface LanguageSwitcherProps {
  customIcon?: string;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  customIcon,
  className = ''
}) => {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();
   const { value: isOpen, toggle, close } = useToggle(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  const languages = [
    { code: 'fr', name: t('languages.fr'), flag: '/assets/website/icons/french.png' },
    { code: 'it', name: t('languages.it'), flag: '/assets/website/icons/italy.png' },
    { code: 'de', name: t('languages.de'), flag: '/assets/website/icons/switzerland.png' },
    { code: 'en', name: t('languages.en'), flag: '/assets/website/icons/uk.png' },
  ] as const;

  const isRestrictedPage = ['/terms', '/privacy', '/imprint'].includes(pathname);
  const displayedLanguages = isRestrictedPage 
    ? languages.filter(l => l.code === 'en' || l.code === 'de') 
    : languages;

  const handleLanguageChange = async (newLocale: string) => {
    close();
    startLoading();
    // 1. Update persistent cookies
    await updateLanguageAction(newLocale);
    // 2. Try to update DB if user is logged in (best effort)
    try {
      await updateProfileField('preferred_language', newLocale);
    } catch (e) {
      // Ignore if not logged in
    }
    // 3. Perform the redirect
    router.replace(pathname, { locale: newLocale as "en" | "de" | "fr" | "it" });
  };

  const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.code === 'de')!;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="unstyled"
        onClick={toggle}
        className="flex items-end gap-0 transition-opacity hover:opacity-80 p-0 h-auto border-none bg-transparent hover:bg-transparent shadow-none"
        aria-label="Select language"
      >
        <div className="relative w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] flex-shrink-0">
          <Image
            src={customIcon || currentLang.flag}
            alt={currentLang.name}
            fill
            sizes="32px"
            className="object-contain"
          />
        </div>
        <div className="relative w-[12px] h-[12px] flex-shrink-0 ml-[3px] mt-auto mb-0.5">
          <Image
            src="/assets/website/icons/lite-grey-arrow-down.png"
            alt="Dropdown"
            fill
            sizes="12px"
            className="object-contain"
          />
        </div>
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-4 bg-white border border-black/5 shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[200px] h-auto rounded-[10px] pt-2 pb-2 flex flex-col gap-0.5"
        >
          {displayedLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-start gap-4 px-6 py-3 transition-colors hover:bg-background-secondary border-none rounded-none shadow-none text-left ${locale === lang.code ? 'text-primary bg-primary/5' : 'text-secondary'
                }`}
            >
              <div className="relative w-[30px] h-[22px] flex items-center justify-center flex-shrink-0">
                <Image
                  src={lang.flag}
                  alt={lang.name}
                  fill
                  sizes="30px"
                  className="object-contain"
                />
              </div>
              <Text
                as="span"
                variant="text-xs"
                className={`font-normal ${locale === lang.code ? 'text-primary' : 'text-secondary'}`}
              >
                {lang.name}
              </Text>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
