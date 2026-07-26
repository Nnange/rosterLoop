import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Add a locale here and create the matching messages/<locale>.json file.
  locales: ['en', 'de'],
  defaultLocale: 'en',
})

export type Locale = (typeof routing.locales)[number]
