'use client'

import { useState } from 'react'
import { useFocusTrap } from '@/app/hooks/useFocusTrap'

interface InviteModalProps {
  readonly isOpen: boolean
  readonly householdName: string
  readonly isInviting: boolean
  readonly onInvite: (email: string) => Promise<void>
  readonly onCancel: () => void
}

export default function InviteModal({
  isOpen,
  householdName,
  isInviting,
  onInvite,
  onCancel,
}: Readonly<InviteModalProps>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await onInvite(email)
      setEmail('')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to send invitation')
      }
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
        aria-labelledby="invite-modal-title"
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4 dark:bg-gray-800 dark:shadow-black/40"
      >
        <h2 id="invite-modal-title" className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">Invite to Household</h2>
        <p className="text-gray-600 mb-4 dark:text-gray-400">
          Invite a user to <strong>{householdName}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            disabled={isInviting}
          />

          {error && (
            <p className="text-red-600 text-sm mb-4 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isInviting}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isInviting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
