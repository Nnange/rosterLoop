'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  loading: boolean
  error: string | null
  isTokenExpired: () => boolean
}

interface AuthUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  role?: string
  emailVerified?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (storedToken && storedUser) {
      // Check if token has expired
      if (tokenExpiry) {
        const expiryTime = Number.parseInt(tokenExpiry, 10)
        const currentTime = Date.now()
        
        if (currentTime > expiryTime) {
          // Token has expired, logout automatically
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          localStorage.removeItem('tokenExpiry')
        } else {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } else {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = 'Invalid email or password'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // If response body is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      const authUser: AuthUser = {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      }

      setToken(data.accessToken)
      setUser(authUser)
      
      // Store token expiry time (expiresIn is in seconds, convert to milliseconds)
      const expiryTime = Date.now() + (data.expiresIn * 1000)
      localStorage.setItem('authToken', data.accessToken)
      localStorage.setItem('authUser', JSON.stringify(authUser))
      localStorage.setItem('tokenExpiry', expiryTime.toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      if (!response.ok) {
        let errorMessage = 'Signup failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // If response body is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      const authUser: AuthUser = {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        emailVerified: data.emailVerified,
      }

      setToken(data.accessToken)
      setUser(authUser)
      
      // Store token expiry time (expiresIn is in seconds, convert to milliseconds)
      const expiryTime = Date.now() + (data.expiresIn * 1000)
      localStorage.setItem('authToken', data.accessToken)
      localStorage.setItem('authUser', JSON.stringify(authUser))
      localStorage.setItem('tokenExpiry', expiryTime.toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('tokenExpiry')
  }, [])

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    if (!tokenExpiry) return false
    
    const expiryTime = Number.parseInt(tokenExpiry, 10)
    return Date.now() > expiryTime
  }, [])

  // Monitor token expiration and auto-logout
  useEffect(() => {
    if (!token) return

    // Check immediately
    if (isTokenExpired()) {
      logout()
      return
    }

    // Set up a polling interval to check token expiration every 10 seconds
    const expiryCheckInterval = setInterval(() => {
      if (isTokenExpired()) {
        console.warn('Token has expired. Logging out automatically.')
        logout()
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(expiryCheckInterval)
  }, [token, logout, isTokenExpired])

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('authToken')
    if (!storedToken) return

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const authUser: AuthUser = {
          userId: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          emailVerified: data.emailVerified,
        }
        setUser(authUser)
        localStorage.setItem('authUser', JSON.stringify(authUser))
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
      refreshUser,
      loading,
      error,
      isTokenExpired,
    }),
    [user, token, login, signup, logout, refreshUser, loading, error, isTokenExpired]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
