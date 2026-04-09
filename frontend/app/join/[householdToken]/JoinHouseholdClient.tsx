'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface HouseholdInfo {
  id: string
  name: string
  ownerName: string
  memberCount: number
}

type PageState = 'loading' | 'verify' | 'needs-auth' | 'processing' | 'success' | 'error'

export default function JoinHouseholdClient() {
  const params = useParams()
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo | null>(null)
  const [error, setError] = useState('')

  const householdToken = params.householdToken as string

  // Step 1: Verify the household token and get household info
  useEffect(() => {
    if (!householdToken) return

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/households/join/verify/${householdToken}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          setHouseholdInfo(data)
          
          // If user is already authenticated, join directly
          if (user && token && !authLoading) {
            joinHousehold(token)
          } else if (!authLoading) {
            // Redirect to login/signup with return URL
            setPageState('needs-auth')
          }
        } else if (response.status === 404) {
          setPageState('error')
          setError('Invalid or expired join link. Please check the link and try again.')
        } else {
          setPageState('error')
          setError('Failed to verify join link. Please try again.')
        }
      } catch (err) {
        setPageState('error')
        setError('Error verifying join link. Please try again.')
        console.error('Verification error:', err)
      }
    }

    verifyToken()
  }, [householdToken, authLoading])

  // Step 2: If user logs in/signs up, automatically join household
  useEffect(() => {
    if (user && token && !authLoading && pageState !== 'success' && pageState !== 'processing') {
      joinHousehold(token)
    }
  }, [user, token, authLoading])

  // Step 3: Join the household
  const joinHousehold = async (authToken: string) => {
    setPageState('processing')
    try {
      const response = await fetch(
        `${API_BASE_URL}/households/join/${householdToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      if (response.ok) {
        setPageState('success')
        // Redirect to the household after 2 seconds
        setTimeout(() => {
          router.push(`/households/${householdInfo?.id}`)
        }, 2000)
      } else if (response.status === 409) {
        // Already a member
        setPageState('success')
        setError('You are already a member of this household!')
        setTimeout(() => {
          router.push(`/households/${householdInfo?.id}`)
        }, 2000)
      } else {
        const data = await response.json()
        setPageState('error')
        setError(data.message || 'Failed to join household')
      }
    } catch (err) {
      setPageState('error')
      setError('Error joining household. Please try again.')
      console.error('Join error:', err)
    }
  }

  // Loading state
  if (pageState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying join link...</p>
        </div>
      </div>
    )
  }

  // Processing state - joining household
  if (pageState === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Adding you to the household...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-4">
              You've been added to <strong>{householdInfo?.name}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the household...
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Return Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Needs authentication - redirect to login with return URL
  if (pageState === 'needs-auth') {
    const returnUrl = `/join/${householdToken}`
    const isNewUser = householdInfo?.memberCount === 1 // Only owner, so new user

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md">
            {/* Household Info Card */}
            {householdInfo && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join {householdInfo.name}
                </h2>
                <p className="text-gray-600 mb-1">
                  Invited by {householdInfo.ownerName}
                </p>
                <p className="text-sm text-gray-500">
                  {householdInfo.memberCount} {householdInfo.memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>
            )}

            {/* Auth Redirect Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {isNewUser ? 'Create Account to Join' : 'Log In to Join'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isNewUser
                  ? 'Create an account to join this household'
                  : 'Log in with your account to join this household'}
              </p>
              <div className="space-y-3">
                <a
                  href={`/signup?redirect=${encodeURIComponent(returnUrl)}`}
                  className="block w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Sign Up
                </a>
                <a
                  href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
                  className="block w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Log In
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
