'use client'

import { useEffect, useCallback, useState, createContext, useContext, type ReactNode } from 'react'
import { useRouter } from "next/navigation"
import * as authService from '@/features/auth/api/auth-service'
import type { User, CompleteRegistrationPayload } from '@/features/auth/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  loginWithGoogle: () => void
  logout: () => Promise<void>
  completeRegistration: (p: CompleteRegistrationPayload) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = new URLSearchParams(window.location.search).get("accessToken")
      if (token) {
        localStorage.setItem("accessToken", token)
        window.history.replaceState({}, "", window.location.pathname)
      }

      const currUser = await authService.getCurrentUser()
      setUser(currUser)
      if (currUser) authService.persistUser(currUser)
      else authService.clearPersistedUser()
      
      setIsLoading(false)
    }
    init()
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    authService.clearPersistedUser()
    router.replace("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ 
      user, isLoading, isAuthenticated: !!user, 
      loginWithGoogle: authService.loginWithGoogle,
      logout,
      completeRegistration: authService.completeRegistration 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}