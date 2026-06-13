'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'

const OPTIONS = [
  { value: 'light', labelKey: 'light', Icon: SunIcon },
  { value: 'dark', labelKey: 'dark', Icon: MoonIcon },
  { value: 'system', labelKey: 'system', Icon: MonitorIcon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Theme')
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch: the resolved theme is only known on the client,
  // so we defer reading it until after mount. This one-time flag is the
  // documented next-themes pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <div
      role="radiogroup"
      aria-label={t('label')}
      className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800"
    >
      {OPTIONS.map(({ value, labelKey, Icon }) => {
        const active = mounted && theme === value
        const label = t(labelKey)
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              active
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
