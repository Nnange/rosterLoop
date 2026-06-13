'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { GlobeIcon } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value
    startTransition(() => {
      // Stay on the same page, swap only the locale segment.
      router.replace(
        // @ts-expect-error -- `params` is loosely typed across dynamic routes
        { pathname, params },
        { locale: nextLocale },
      )
    })
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('label')}</span>
      <GlobeIcon
        className="pointer-events-none absolute left-2 h-4 w-4 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      />
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        className="appearance-none rounded-lg border border-gray-200 bg-gray-100 py-1 pl-7 pr-2 text-xs font-medium text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  )
}
