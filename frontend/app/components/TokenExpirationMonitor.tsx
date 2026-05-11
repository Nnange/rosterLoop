'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

/**
 * Global token expiration monitor component
 * Runs on all routes and automatically logs out when token expires
 */
export function TokenExpirationMonitor() {
  const { logout, isTokenExpired } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Set up interval to check token expiration every 5 seconds
    const checkInterval = setInterval(() => {
      if (isTokenExpired()) {
        console.warn('Token has expired globally. Logging out...')
        logout()
        router.push('/login')
      }
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [logout, isTokenExpired, router])

  // This component doesn't render anything
  return null
}
