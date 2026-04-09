'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required')
      return
    }

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
      
      setFormError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-96 mb-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4">
        Don't have an account?{' '}
        <a href="/signup" className="text-indigo-600 hover:underline font-semibold">
          Sign up
        </a>
      </p>

      {showForgotPassword && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <p className="text-center text-gray-700 mb-3">
            Trouble signing in?
          </p>
          <a
            href="/forgot-password"
            className="block w-full text-center bg-gray-100 text-indigo-600 py-2 rounded hover:bg-gray-200 transition-colors font-semibold"
          >
            Reset Your Password
          </a>
        </div>
      )}
    </div>
  )
}
