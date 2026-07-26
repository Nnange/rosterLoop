'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, error } = useAuth()
  const t = useTranslations('Signup')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  // Local submitting state for the signup request. Deliberately not the
  // AuthContext `loading` flag: that starts `true` during the mount-time auth
  // bootstrap, which would disable the form on first paint and cause an SSR/
  // client hydration mismatch (server snapshots loading=true, client hydrates
  // after the provider effect sets it false).
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!formData.email.trim() || !formData.password.trim() || 
        !formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError(t('errorAllRequired'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError(t('errorPasswordMatch'))
      return
    }

    if (formData.password.length < 8) {
      setFormError(t('errorPasswordLength'))
      return
    }

    setSubmitting(true)
    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName)
      const redirectUrl = searchParams.get('redirect')
      if (redirectUrl) {
        // Store the returnUrl in localStorage so verify-email can use it
        localStorage.setItem('pendingReturnUrl', redirectUrl)
        // Go to verification with return to join
        router.push(`/verification-required?returnUrl=${encodeURIComponent(redirectUrl)}`)
      } else {
        // Otherwise, go to default verification page
        router.push('/verification-required')
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('errorFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const redirect = searchParams.get('redirect')
  const loginHref = redirect
    ? { pathname: '/login' as const, query: { redirect } }
    : { pathname: '/login' as const }

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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('firstName')}
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="John"
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('lastName')}
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="Doe"
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder={t('emailPlaceholder')}
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="••••••••"
            disabled={submitting}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
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
        {t('haveAccount')}{' '}
        <Link href={loginHref} className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400">
          {t('logIn')}
        </Link>
      </p>
    </div>
  )
}
