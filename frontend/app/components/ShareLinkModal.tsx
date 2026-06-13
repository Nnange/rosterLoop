'use client'

import { useState } from 'react'

interface ShareLinkModalProps {
  readonly isOpen: boolean
  readonly householdId: string
  readonly householdName: string
  readonly joinLink: string
  readonly onClose: () => void
}

export default function ShareLinkModal({
  isOpen,
  householdId,
  householdName,
  joinLink,
  onClose,
}: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the backdrop itself, not the modal content
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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-link-title"
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 dark:bg-gray-800 dark:shadow-black/40"
      >
        <h2 id="share-link-title" className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">
          Share {householdName}
        </h2>

        <p className="text-gray-600 mb-4 dark:text-gray-400">
          Share this link with flatmates to let them join the household without needing an email invitation.
        </p>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900/40 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2 font-semibold dark:text-gray-400">Join Link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={joinLink}
              readOnly
              aria-label="Household join link"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded font-medium text-sm transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 dark:text-gray-400">
          Anyone with this link can join {householdName} without an invitation email.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
