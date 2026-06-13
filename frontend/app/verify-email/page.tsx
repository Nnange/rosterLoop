'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { checkMemberStatus } from '@/app/utils/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const email = searchParams.get('email')

  useEffect(() => {
    if (!email) {
      setStatus('error')
      setMessage('No email provided. Please check your verification link.')
      return
    }

    const verifyEmail = async () => {
      try {
        // Call backend endpoint to verify email
        const response = await fetch(`${API_BASE_URL}/auth/verify-email?email=${encodeURIComponent(email)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          
          // Check if there's a pending return URL (from join flow)
          const pendingReturnUrl = localStorage.getItem('pendingReturnUrl')
          
          // Redirect based on pending return URL or household membership after 2 seconds
          setTimeout(async () => {
            if (pendingReturnUrl) {
              // Clear the pending return URL
              localStorage.removeItem('pendingReturnUrl')
              // Redirect to the join page (or wherever they came from)
              router.push(pendingReturnUrl)
            } else {
              // Check if user has household membership
              try {
                const memberStatus = await checkMemberStatus()
                
                if (memberStatus.hasMembership) {
                  // User has households, redirect to households page
                  router.push('/households')
                } else {
                  // User has no households, redirect to waiting page
                  router.push('/waiting')
                }
              } catch (err) {
                console.error('Error checking membership status:', err)
                // Default to waiting page if check fails
                router.push('/waiting')
              }
            }
          }, 2000)
        } else {
          // Handle non-JSON responses
          let errorMessage = 'Failed to verify email. Please try again.'
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch {
            // Response wasn't JSON, use default message
            console.error('Error response was not JSON')
          }
          setStatus('error')
          setMessage(errorMessage)
        }
      } catch (err) {
        setStatus('error')
        setMessage('Failed to verify email. Please try again.')
        console.error('Verification error:', err)
      }
    }

    verifyEmail()
  }, [email, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 dark:shadow-black/30">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Verifying Email</h1>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/50">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Email Verified!</h1>
              <p className="text-gray-600 mb-4 dark:text-gray-400">
                Your email {email} has been successfully verified.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to login page in a few seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/50">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Verification Failed</h1>
              <p className="text-gray-600 mb-4 dark:text-gray-400">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function VerifyEmailLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col dark:from-gray-900 dark:to-gray-950">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800 dark:shadow-black/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Loading</h1>
            <p className="text-gray-600 dark:text-gray-400">Preparing verification...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
