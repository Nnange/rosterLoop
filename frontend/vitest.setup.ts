import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'
import enMessages from '@/messages/en.json'

// --- next-intl: resolve translations against the real English catalog so
// component text assertions keep working without a provider. ---
vi.mock('next-intl', () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, unknown>) => {
      const ns = (enMessages as Record<string, Record<string, string>>)[
        namespace
      ]
      let msg = ns?.[key] ?? `${namespace}.${key}`
      if (values) {
        for (const k of Object.keys(values)) {
          msg = msg.replaceAll(`{${k}}`, String(values[k]))
        }
      }
      return msg
    },
  useLocale: () => 'en',
}))

// --- @/i18n/navigation: render Link as a plain anchor (serializing object
// hrefs) and DELEGATE the router to next/navigation, so tests that already
// spy on next/navigation's useRouter keep working unchanged. ---
vi.mock('@/i18n/navigation', async () => {
  const nav = (await import('next/navigation')) as {
    useRouter: () => unknown
  }
  return {
    Link: ({
      href,
      children,
      ...props
    }: {
      href: string | { pathname: string; query?: Record<string, string> }
      children: React.ReactNode
    }) => {
      const serialized =
        typeof href === 'string'
          ? href
          : href.pathname +
            (href.query
              ? `?${new URLSearchParams(href.query).toString()}`
              : '')
      return React.createElement('a', { href: serialized, ...props }, children)
    },
    // Delegate to next/navigation so tests that spy on its useRouter keep
    // working; fall back to a no-op router when it isn't mocked.
    useRouter: () => {
      try {
        return nav.useRouter()
      } catch {
        return { push: vi.fn(), replace: vi.fn() }
      }
    },
    usePathname: () => '/',
    redirect: vi.fn(),
    getPathname: vi.fn(),
  }
})
