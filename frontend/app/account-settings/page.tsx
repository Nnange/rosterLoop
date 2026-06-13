'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, token, logout, loading, refreshUser } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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

  const handleUpdateProfile = async () => {
    if (!token) return

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    setIsUpdatingProfile(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      })

      if (response.ok) {
        setSuccess('Profile updated successfully')
        setEditingProfile(false)
        // Refresh user data
        if (refreshUser) {
          await refreshUser()
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Error updating profile. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setIsChangingPassword(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        setSuccess('Password changed successfully')
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to change password')
      }
    } catch (err) {
      setError('Error changing password. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsChangingPassword(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main id="main-content" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 dark:bg-gray-800 dark:shadow-black/30">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 dark:text-gray-100">Account Settings</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Account Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 dark:bg-gray-700/40">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Member'}
                </p>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className={`mb-6 p-3 rounded ${success ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300' : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'}`}>
              {error || success}
            </div>
          )}

          <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Edit Profile</h2>
            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    disabled={isUpdatingProfile}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    disabled={isUpdatingProfile}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false)
                      setFirstName(user.firstName)
                      setLastName(user.lastName)
                      setError('')
                    }}
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Edit Name
              </button>
            )}
          </div>

          <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Password</h2>
            {showChangePassword ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Password must be at least 8 characters long.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePassword(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Change Password
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 dark:bg-red-950/30 dark:border-red-900">
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
                Deleting your account is permanent and cannot be undone. This will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4 dark:text-gray-300">
                <li>Remove your account and all associated data</li>
                <li>Remove you from all households</li>
                <li>Cancel any pending invitations</li>
              </ul>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
                  {error}
                </div>
              )}

              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
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
