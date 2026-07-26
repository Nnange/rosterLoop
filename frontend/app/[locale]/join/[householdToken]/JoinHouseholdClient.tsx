'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'
import { api } from '@/app/utils/api' // 🔒 Secure API with HTTPOnly cookies

interface HouseholdInfo {
  id: string
  name: string
  ownerName: string
  memberCount: number
  maxMembers: number
}

type PageState = 'loading' | 'verify' | 'needs-auth' | 'processing' | 'success' | 'already-member' | 'error'

export default function JoinHouseholdClient() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth() // 🔒 Removed token - HTTPOnly cookies
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo | null>(null)
  const [error, setError] = useState('')
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const isJoiningRef = useRef(false)

  const householdToken = params.householdToken as string

  // Refresh user data on mount to get latest emailVerified status
  useEffect(() => {
    // 🔒 Refresh user if authenticated (HTTPOnly cookies handle authentication)
    if (user && !hasRefreshed) {
      refreshUser().then(() => setHasRefreshed(true))
    }
  }, [user, hasRefreshed, refreshUser])

  // Step 1: Verify the household token and get household info
  useEffect(() => {
    if (!householdToken) return
    // Wait for user refresh if we have a user
    if (user && !hasRefreshed) return

    const verifyToken = async () => {
      try {
        // 🔒 Use secure API utility with HTTPOnly cookies
        const response = await api.get(`/households/join/verify/${householdToken}`)
        
        const data = response.data
        setHouseholdInfo(data)
        
        // If user is already authenticated, check if email is verified
        if (user && !authLoading) {
          // Check if user has verified their email
          if (!user.emailVerified) {
            // Store the return URL and redirect to verification-required page
            const returnUrl = `/join/${householdToken}`
            localStorage.setItem('pendingReturnUrl', returnUrl)
            router.push(`/verification-required?returnUrl=${encodeURIComponent(returnUrl)}`)
            return
          }
          joinHousehold()
        } else if (!authLoading) {
          // Redirect to login/signup with return URL
          setPageState('needs-auth')
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setPageState('error')
          setError('Invalid or expired join link. Please check the link and try again.')
        } else {
          setPageState('error')
          setError('Failed to verify join link. Please try again.')
          console.error('Verification error:', err)
        }
      }
    }

    verifyToken()
  }, [householdToken, authLoading, hasRefreshed, user, router])

  // Step 2: If user logs in/signs up, automatically join household
  useEffect(() => {
    // Wait for user refresh if we have a user
    if (user && !hasRefreshed) return
    
    if (user && !authLoading && pageState !== 'success' && pageState !== 'processing') {
      // Check if user has verified their email
      if (!user.emailVerified) {
        // Store the return URL and redirect to verification-required page
        const returnUrl = `/join/${householdToken}`
        localStorage.setItem('pendingReturnUrl', returnUrl)
        router.push(`/verification-required?returnUrl=${encodeURIComponent(returnUrl)}`)
        return
      }
      // 🔒 HTTPOnly cookies handle authentication automatically
      joinHousehold()
    }
  }, [user, authLoading, hasRefreshed, householdToken, pageState, router])

  // Step 3: Join the household
  const joinHousehold = async () => {
    // Prevent duplicate join calls
    if (isJoiningRef.current) return
    isJoiningRef.current = true
    
    setPageState('processing')
    try {
      // 🔒 Use secure API utility with HTTPOnly cookies
      await api.post(`/households/join/${householdToken}`)
      
      setPageState('success')
      // Redirect to households page after 2 seconds
      setTimeout(() => {
        router.push('/households')
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 409) {
        const data = err.response.data
        // Could be already a member, owner, or household is full
        if (data?.message?.includes('full')) {
          setPageState('error')
          setError(data.message)
        } else {
          // Already a member or owner
          setPageState('already-member')
          setTimeout(() => {
            router.push('/households')
          }, 3000)
        }
      } else if (err.response?.status === 400) {
        // Could be validation error
        const data = err.response.data
        setPageState('error')
        setError(data.message || 'Cannot join household. Please try again.')
      } else {
        const data = err.response?.data
        setPageState('error')
        setError(data?.message || 'Failed to join household')
        console.error('Join error:', err)
      }
    } finally {
      isJoiningRef.current = false
    }
  }

  // Loading state
  if (pageState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying join link...</p>
        </div>
      </div>
    )
  }

  // Processing state - joining household
  if (pageState === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Adding you to the household...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <main id="main-content" className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-black/30">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Welcome!</h2>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              You've been added to <strong>{householdInfo?.name}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you to the household...
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Already a member state
  if (pageState === 'already-member') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <main id="main-content" className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-black/30">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto dark:bg-blue-900/50">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Already a Member!</h2>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              You're already a member of <strong>{householdInfo?.name}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you to your households...
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <main id="main-content" className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-black/30">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Something went wrong</h2>
            <p className="text-gray-600 mb-6 dark:text-gray-400">{error}</p>
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
    const isFull = householdInfo && householdInfo.memberCount >= householdInfo.maxMembers

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <main id="main-content" className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md">
            {/* Household Info Card */}
            {householdInfo && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center dark:bg-gray-800 dark:shadow-black/30">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
                  Join {householdInfo.name}
                </h2>
                <p className="text-gray-600 mb-3 dark:text-gray-400">
                  Invited by {householdInfo.ownerName}
                </p>
                <p className="text-sm text-gray-700 font-medium mb-1 dark:text-gray-300">
                  Members: {householdInfo.memberCount} / {householdInfo.maxMembers}
                </p>
                {isFull && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded mt-2 dark:text-red-400 dark:bg-red-950/40">
                    This household is at capacity and cannot accept new members.
                  </p>
                )}
              </div>
            )}

            {/* Auth Redirect Card - Only show if not full */}
            {!isFull && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center dark:bg-gray-800 dark:shadow-black/30">
                <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-100">
                  {isNewUser ? 'Create Account to Join' : 'Log In to Join'}
                </h3>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  {isNewUser
                    ? 'Create an account to join this household'
                    : 'Log in with your account to join this household'}
                </p>
                <div className="space-y-3">
                  <Link
                    href={{ pathname: '/signup', query: { redirect: returnUrl } }}
                    className="block w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href={{ pathname: '/login', query: { redirect: returnUrl } }}
                    className="block w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            )}

            {/* Full Household - Cannot Join */}
            {isFull && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center dark:bg-gray-800 dark:shadow-black/30">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto dark:bg-yellow-900/50">
                    <svg
                      className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">
                  Household Full
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Unfortunately, this household has reached its maximum capacity and cannot accept new members.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return null
}
