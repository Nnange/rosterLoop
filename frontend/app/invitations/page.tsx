'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface Invitation {
  id: string
  householdName: string
  inviterName: string
  status: string
  invitedAt: string
  expiresAt: string
}

export default function InvitationsPage() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchPendingInvitations()
    }
  }, [user, token, authLoading, router])

  const fetchPendingInvitations = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/invitations/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load invitations')
      }
    } catch (err) {
      setError('Error fetching invitations')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!token) return

    setAcceptingId(invitationId)
    try {
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
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
        setError('')
        // Redirect to households after accepting
        setTimeout(() => {
          router.push('/households')
        }, 1000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Error accepting invitation')
      console.error('Error:', err)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    if (!token) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/${invitationId}/decline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
      } else {
        setError('Failed to decline invitation')
      }
    } catch (err) {
      setError('Error declining invitation')
      console.error('Error:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Household Invitations</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">You don't have any pending invitations.</p>
            <button
              onClick={() => router.push('/households')}
              className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Households
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{invitation.householdName}</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Invited by <strong>{invitation.inviterName}</strong>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                  You've been invited to join this household on RosterLoop. Accept to start managing cleaning schedules together!
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    disabled={acceptingId === invitation.id}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {acceptingId === invitation.id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
