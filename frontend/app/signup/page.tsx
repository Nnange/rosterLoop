'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

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
      setFormError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long')
      return
    }

    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName)
      const redirectUrl = searchParams.get('redirect') || '/verification-required'
      router.push(redirectUrl)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8">
      <Header />
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {(formError || error) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Doe"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 hover:underline font-semibold">
            Log in
          </a>
        </p>
      </div>
      <Footer />
    </div>
  )
}
