'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { isAdmin } from '@/app/utils/roleUtils'
import Header from '@/app/components/Header'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface Household {
  id: string
  householdName: string
  flatmateNames: string[]
  createdAt: string
}

export default function EditHouseholdClient() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const householdId = params.id as string

  const [household, setHousehold] = useState<Household | null>(null)
  const [householdName, setHouseholdName] = useState('')
  const [flatmateNames, setFlatmateNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && !isAdmin(user.role)) {
      router.push('/waiting')
      return
    }

    if (user && token) {
      fetchHousehold()
    }
  }, [user, token, authLoading, router])

  const fetchHousehold = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/households/${householdId}`,
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
        setHousehold(data)
        setHouseholdName(data.householdName)
        setFlatmateNames(data.flatmateNames || [])
      } else if (response.status === 401) {
        router.push('/login')
      } else if (response.status === 403) {
        setError('You do not have permission to edit this household')
      } else {
        setError('Failed to load household')
      }
    } catch (err) {
      setError('Error fetching household')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!householdName.trim()) {
      setError('Household name is required')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/households/${householdId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            householdName: householdName,
            flatmateNames: flatmateNames,
          }),
        }
      )

      if (response.ok) {
        router.push('/households')
      } else {
        setError('Failed to update household')
      }
    } catch (err) {
      setError('Error updating household')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/households')}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Household</h1>

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

          {household && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-2">
                  Household Name
                </label>
                <input
                  id='householdName'
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor={`flatmateName`} className="block text-sm font-medium text-gray-700 mb-2">
                  Flatmates
                </label>
                <div className="space-y-2">
                  {flatmateNames.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        id={`flatmateName-${index}`}
                        type="text"
                        value={name}
                        onChange={(e) => {
                          const newNames = [...flatmateNames]
                          newNames[index] = e.target.value
                          setFlatmateNames(newNames)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        placeholder="Flatmate name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newNames = flatmateNames.filter((_, i) => i !== index)
                          setFlatmateNames(newNames)
                        }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFlatmateNames([...flatmateNames, ''])}
                  className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  + Add Flatmate
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/households')}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
