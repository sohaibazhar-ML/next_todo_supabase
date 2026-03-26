import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // List of all supported locales
  locales: ['de', 'en', 'fr', 'it'],

  // German is the default locale
  defaultLocale: 'de',

  // Use prefix for all locales (including default)
  localePrefix: 'always'
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);

export type Locale = (typeof routing.locales)[number];

