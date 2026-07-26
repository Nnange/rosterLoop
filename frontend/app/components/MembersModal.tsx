'use client'

import { useState, useEffect } from 'react'
import { useFocusTrap } from '@/app/hooks/useFocusTrap'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface Member {
  memberId: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  status: 'MEMBER' | 'PENDING' | 'DECLINED' | 'EXPIRED'
  joinedAt?: string
}

interface MembersModalProps {
  isOpen: boolean
  householdId: string
  householdName: string
  token: string | null
  onClose: () => void
  onMemberRemoved: () => void
}

export default function MembersModal({
  isOpen,
  householdId,
  householdName,
  token,
  onClose,
  onMemberRemoved,
}: Readonly<MembersModalProps>) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen)

  useEffect(() => {
    if (isOpen && token) {
      fetchMembers()
    }
  }, [isOpen, householdId, token])

  const fetchMembers = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError('')
      const response = await fetch(
        `${API_BASE_URL}/invitations/households/${householdId}/members`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        setError('Failed to load members')
      }
    } catch (err) {
      setError('Error fetching members')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!token) return

    setRemovingId(memberId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/households/${householdId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setMembers(members.filter((m) => m.memberId !== memberId))
        onMemberRemoved()
      } else {
        setError('Failed to remove member')
      }
    } catch (err) {
      setError('Error removing member')
      console.error('Error:', err)
    } finally {
      setRemovingId(null)
    }
  }

  const handleUpdateDisplayName = async (memberId: string, displayName: string) => {
    if (!token || !displayName.trim()) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/households/${householdId}/members/${memberId}/display-name`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ displayName: displayName.trim() }),
        }
      )

      if (response.ok) {
        // Update the member's display name in local state
        setMembers(
          members.map((m) =>
            m.memberId === memberId ? { ...m, displayName: displayName.trim() } : m
          )
        )
        setEditingId(null)
        setEditingName('')
      } else {
        setError('Failed to update display name')
      }
    } catch (err) {
      setError('Error updating display name')
      console.error('Error:', err)
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="members-modal-title"
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto dark:bg-gray-800 dark:shadow-black/40"
      >
        <h2 id="members-modal-title" className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-100">{householdName} - Members</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2 dark:border-indigo-400"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <p className="text-gray-600 text-center py-8 dark:text-gray-400">No members yet</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700/40"
              >
                <div className="flex-1">
                  {editingId === member.memberId && member.status === 'MEMBER' ? (
                    <div className="mb-2">
                      <input
                        type="text"
                        defaultValue={member.displayName || `${member.firstName} ${member.lastName}`}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Display name"
                        className="w-full px-2 py-1 border border-indigo-300 rounded text-sm dark:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() =>
                            handleUpdateDisplayName(member.memberId, editingName)
                          }
                          className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditingName('')
                          }}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400">
                        {member.displayName ||
                          (member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.email)}
                      </p>
                      {member.status === 'MEMBER' && (
                        <button
                          onClick={() => {
                            setEditingId(member.memberId)
                            setEditingName(
                              member.displayName ||
                                `${member.firstName} ${member.lastName}`
                            )
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit name
                        </button>
                      )}
                    </>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">{member.email}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs rounded font-medium ${
                      member.status === 'MEMBER'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : member.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                {member.status === 'MEMBER' && (
                  <button
                    onClick={() => handleRemoveMember(member.memberId)}
                    disabled={removingId === member.memberId}
                    className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {removingId === member.memberId ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}
