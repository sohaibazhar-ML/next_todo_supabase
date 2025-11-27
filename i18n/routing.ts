import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // List of all supported locales
  locales: ['de', 'en', 'fr', 'it'],

  // German is the default locale
  defaultLocale: 'de',

  // Use prefix for all locales (including default)
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

