'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { isAdmin } from '@/app/utils/roleUtils'
import Header from '@/app/components/Header'

export default function WaitingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // If admin, redirect to households page
  if (isAdmin(user.role)) {
    router.push('/households')
    return null
  }

  return (
    <>
      <Header />
      <div id="main-content" className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)] dark:from-gray-900 dark:to-gray-950">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-black/30">
        <div className="mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-indigo-900/50">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 1 1 0 000 2h10a1 1 0 100-2 2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
          Welcome, {user.firstName}!
        </h1>

        <p className="text-gray-600 mb-4 dark:text-gray-400">
          The household roster is being set up by your admin. Once it's ready, you'll be able to see your cleaning schedule here.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-950/40 dark:border-blue-900">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> You can log out and come back later to check if the roster is ready.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your Email: <span className="font-semibold text-gray-700 dark:text-gray-200">{user.email}</span>
          </p>
        </div>
        </div>
      </div>
    </>
  )
}
