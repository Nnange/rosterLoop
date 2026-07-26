'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, error } = useAuth()
  const t = useTranslations('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  // Local submitting state for the login request. Deliberately not the
  // AuthContext `loading` flag: that starts `true` during the mount-time auth
  // bootstrap, which would disable the form on first paint and cause an SSR/
  // client hydration mismatch (server snapshots loading=true, client hydrates
  // after the provider effect sets it false).
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError(t('errorRequired'))
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      setFailedAttempts(0)
      setShowForgotPassword(false)
      const redirectUrl = searchParams.get('redirect') || '/'
      router.push(redirectUrl)
    } catch (err) {
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (newFailedAttempts >= 3) {
        setShowForgotPassword(true)
      }

      setFormError(err instanceof Error ? err.message : t('errorFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const redirect = searchParams.get('redirect')
  const signupHref = redirect
    ? { pathname: '/signup' as const, query: { redirect } }
    : { pathname: '/signup' as const }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm mb-10 dark:bg-gray-800 dark:shadow-black/30">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('email')}
          </label>
          <input
            id='email'
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder={t('emailPlaceholder')}
            disabled={submitting}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('password')}
          </label>
          <input
            id='password'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="••••••••"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4 dark:text-gray-400">
        {t('noAccount')}{' '}
        <Link
          href={signupHref}
          className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400"
        >
          {t('signUp')}
        </Link>
      </p>

      {showForgotPassword && (
        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-center text-gray-700 mb-3 dark:text-gray-300">
            {t('trouble')}
          </p>
          <Link
            href="/forgot-password"
            className="block w-full text-center bg-gray-100 text-indigo-600 py-2 rounded hover:bg-gray-200 transition-colors font-semibold dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600"
          >
            {t('resetPassword')}
          </Link>
        </div>
      )}
    </div>
  )
}
