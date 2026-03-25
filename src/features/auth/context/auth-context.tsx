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
  refreshUser: () => Promise<void> 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. ฟังก์ชันสำหรับโหลดข้อมูล User ล่าสุด
  // เราแยกออกมาเป็นฟังก์ชันกลางเพื่อให้เรียกใช้ซ้ำได้ทั้งตอนเปิดแอป และตอนเปลี่ยนชื่อสำเร็จ
  const fetchUser = useCallback(async () => {
    try {
      const currUser = await authService.getCurrentUser()
      setUser(currUser)
      if (currUser) authService.persistUser(currUser)
      else authService.clearPersistedUser()
    } catch (error) {
      console.error("Fetch user error:", error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const token = new URLSearchParams(window.location.search).get("accessToken")
      if (token) {
        localStorage.setItem("accessToken", token)
        window.history.replaceState({}, "", window.location.pathname)
      }

      await fetchUser() // เรียกใช้ฟังก์ชันดึงข้อมูล
      setIsLoading(false)
    }
    init()
  }, [fetchUser])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    authService.clearPersistedUser()
    router.replace("/login")
  }, [router])

  // 2. สร้าง refreshUser ส่งออกไปให้หน้า Change Name เรียกใช้
  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  // 3. ปรับปรุง completeRegistration ให้โหลดข้อมูล User ใหม่หลังลงทะเบียนเสร็จด้วย (ถ้าจำเป็น)
  const completeRegistration = useCallback(async (p: CompleteRegistrationPayload) => {
    const newUser = await authService.completeRegistration(p)
    setUser(newUser) // อัปเดต state ทันทีหลัง complete registration
    return newUser
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      loginWithGoogle: authService.loginWithGoogle,
      logout,
      completeRegistration,
      refreshUser
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