'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher'
}

export interface StudentProfile extends User {
  level: number
  total_xp: number
  streak: number
  last_login_date: string
  badges_earned: string[]
}

interface AuthContextType {
  user: User | null
  studentProfile: StudentProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      await refreshUser()
    }
    initAuth()
  }, [])

  const refreshUser = async () => {
    try {
      console.log('[v0] Checking authentication...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Send cookies with request
        cache: 'no-store', // Don't cache auth responses
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Auth valid, user:', data.user)
        setUser(data.user)
        if (data.studentProfile) {
          setStudentProfile(data.studentProfile)
        }
      } else {
        console.log('[v0] Auth invalid, no authenticated user')
        setUser(null)
        setStudentProfile(null)
      }
    } catch (error) {
      console.error('[v0] Failed to refresh user:', error)
      setUser(null)
      setStudentProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('[v0] Login attempt for:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send and receive cookies
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      console.log('[v0] Login success, user:', data.user)
      // Store user data in state
      setUser(data.user)
      if (data.studentProfile) {
        setStudentProfile(data.studentProfile)
      }
      // Mark loading as complete before redirect
      setIsLoading(false)
      console.log('[v0] Redirecting to:', data.user.role === 'teacher' ? '/teacher' : '/learn')
      
      // Redirect after state is set
      setTimeout(() => {
        router.push(data.user.role === 'teacher' ? '/teacher' : '/learn')
      }, 100)
    } catch (error) {
      console.error('[v0] Login error:', error)
      setIsLoading(false)
      throw error
    }
  }

  const signup = async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send and receive cookies
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Signup failed')
      }

      const data = await response.json()
      // Store user data in state
      setUser(data.user)
      if (data.studentProfile) {
        setStudentProfile(data.studentProfile)
      }
      // Mark loading as complete before redirect
      setIsLoading(false)
      
      // Redirect after state is set
      setTimeout(() => {
        router.push(role === 'teacher' ? '/teacher' : '/learn')
      }, 100)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setStudentProfile(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
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
