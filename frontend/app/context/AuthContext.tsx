'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
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
        throw new Error('Invalid email or password')
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
      
      localStorage.setItem('authToken', data.accessToken)
      localStorage.setItem('authUser', JSON.stringify(authUser))
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
        throw new Error('Signup failed')
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
      
      localStorage.setItem('authToken', data.accessToken)
      localStorage.setItem('authUser', JSON.stringify(authUser))
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
  }, [])

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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
        refreshUser,
        loading,
        error,
      }}
    >
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
