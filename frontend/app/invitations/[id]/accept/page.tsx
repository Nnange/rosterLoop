'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

export default function InvitationAcceptPage() {
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
      // User not logged in, redirect to login with return URL
      router.push(`/login?redirect=/invitations/${params.id}/accept`)
      return
    }

    acceptInvitation()
  }, [authLoading, user, params.id, router])

  const acceptInvitation = async () => {
    if (!token) return

    try {
      setLoading(true)
      const invitationId = params.id

      const response = await fetch(
        `http://localhost:8080/rosterloop/api/invitations/${invitationId}/accept`,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loading ? 'Processing invitation...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {status === 'success' && (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to households...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-red-600"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
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
