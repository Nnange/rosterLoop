'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerificationRequiredContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If user is already verified, redirect appropriately
    if (user?.emailVerified) {
      const returnUrl = searchParams.get('returnUrl')
      if (returnUrl) {
        router.push(returnUrl)
      } else {
        router.push('/')
      }
    }
    // If no user is logged in, redirect to login
    if (!user) {
      router.push('/login')
    }
  }, [user, router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 dark:shadow-black/30">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center dark:bg-yellow-900/50">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Verify Your Email</h1>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              We&apos;ve sent a verification email to <span className="font-semibold">{user?.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">
              Please click the link in the email to verify your account and get started.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-600 mb-6 dark:bg-blue-950/40 dark:border-blue-900 dark:text-gray-300">
              <p className="font-medium mb-2">Didn&apos;t receive an email?</p>
              <p>Check your spam folder or contact us for assistance.</p>
            </div>
            <button
              onClick={() => {
                // Log out and go back to login
                localStorage.removeItem('authToken')
                localStorage.removeItem('authUser')
                router.push('/login')
              }}
              className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
