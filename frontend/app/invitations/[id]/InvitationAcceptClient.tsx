'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function InvitationAcceptClient() {
  const params = useParams()
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      // User not logged in, redirect to login
      router.push('/login')
      return
    }

    acceptInvitation()
  }, [authLoading, user])

  const acceptInvitation = async () => {
    if (!token) return

    try {
      setLoading(true)
      const invitationId = params.id

      const response = await fetch(
        `${API_BASE_URL}/invitations/${invitationId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setStatus('success')
        setMessage('Invitation accepted! You are now a member of the household.')
        setTimeout(() => {
          router.push('/households')
        }, 2000)
      } else {
        const data = await response.json()
        setStatus('error')
        setMessage(data.message || 'Failed to accept invitation')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Error accepting invitation. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">{loading ? 'Processing invitation...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main id="main-content" className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-black/30">
          {status === 'success' && (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto dark:bg-green-900/50">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Success!</h1>
              <p className="text-gray-600 mb-6 dark:text-gray-400">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to households...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto dark:bg-red-900/50">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Oops!</h1>
              <p className="text-gray-600 mb-6 dark:text-gray-400">{message}</p>
              <button
                onClick={() => router.push('/households')}
                className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Households
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
