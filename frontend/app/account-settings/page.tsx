'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, token, logout, loading } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login')
    }
  }, [shouldRedirect, router])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleDeleteAccount = async () => {
    if (!token) return

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        // Clear local storage and logout
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        logout()
        // Set redirect flag to trigger useEffect redirect
        setShouldRedirect(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete account')
      }
    } catch (err) {
      setError('Error deleting account. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900">
                  {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Member'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-red-600">
              Danger Zone
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Deleting your account is permanent and cannot be undone. This will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Remove your account and all associated data</li>
                <li>Remove you from all households</li>
                <li>Cancel any pending invitations</li>
              </ul>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">
                    Are you absolutely sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
