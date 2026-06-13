'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { SetupForm } from '@/app/components/SetupForm'
import { isAdmin } from '@/app/utils/roleUtils'
import Header from '@/app/components/Header'
import { v4 as uuidv4 } from 'uuid'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function SetupPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    
    if (!loading && user && !isAdmin(user.role)) {
      router.push('/waiting')
    }
  }, [loading, user, router])

  if (loading || !user || !isAdmin(user.role)) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  async function handleSetupComplete(names: string[]): Promise<void> {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError('')
    try {
      // Create household with the provided names
      const householdName = `Household - ${names.join(', ')}`
      const householdId = uuidv4()
      
      const response = await fetch(`${API_BASE_URL}/households`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: householdId,
          householdName: householdName,
          flatmateNames: names,
        }),
      })

      if (response.ok) {
        // Redirect to households page
        router.push('/households')
      } else {
        const errorData = await response.text()
        console.error('Error response:', response.status, errorData)
        setError(`Failed to create household (${response.status})`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating household:', errorMsg)
      setError(`Error: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Create New Household
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 font-bold text-lg dark:text-red-300 dark:hover:text-red-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:shadow-black/30">
          <SetupForm onComplete={handleSetupComplete} onBack={() => router.push('/households')} />
        </div>
      </div>
    </div>
  )
}
