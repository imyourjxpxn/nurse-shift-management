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

  /**
   * 1. ฟังก์ชันตัวกลางสำหรับจัดการข้อมูล User ก่อนเอาเข้า State
   * ทำหน้าที่รวม firstName + lastName เป็น displayName และจัดการ Persistence
   */
  const handleSetUser = useCallback((userData: User | null) => {
    if (userData) {
      // รวมชื่อเพื่อให้ UI (Header) ยังใช้งาน .displayName ได้ปกติ
      const userWithDisplay = {
        ...userData,
        displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'ตั้งชื่อผู้ใช้'
      }
      setUser(userWithDisplay)
      authService.persistUser(userWithDisplay)
    } else {
      setUser(null)
      authService.clearPersistedUser()
    }
  }, [])

  /**
   * 2. ฟังก์ชันโหลดข้อมูล User จาก API
   */
  const fetchUser = useCallback(async () => {
    try {
      const currUser = await authService.getCurrentUser()
      handleSetUser(currUser)
    } catch (error) {
      console.error("Fetch user error:", error)
      handleSetUser(null)
    }
  }, [handleSetUser])

  /**
   * 3. Initial Load: เช็ค Token และดึงข้อมูลครั้งแรกเมื่อเปิดแอป
   */
  useEffect(() => {
    const init = async () => {
      const token = new URLSearchParams(window.location.search).get("accessToken")
      if (token) {
        localStorage.setItem("accessToken", token)
        window.history.replaceState({}, "", window.location.pathname)
      }

      await fetchUser()
      setIsLoading(false)
    }
    init()
  }, [fetchUser])

  /**
   * 4. ออกจากระบบ
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      handleSetUser(null) // ล้างข้อมูลใน State และ LocalStorage
      router.replace("/login")
    }
  }, [handleSetUser, router])

  /**
   * 5. ฟังก์ชันสำหรับ Refresh ข้อมูล (เรียกใช้จากหน้า Change Name)
   */
  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  /**
   * 6. จัดการขั้นตอนลงทะเบียนเพิ่มเติมหลัง Login ครั้งแรก
   */
  const completeRegistration = useCallback(async (p: CompleteRegistrationPayload) => {
    const newUser = await authService.completeRegistration(p)
    handleSetUser(newUser) // จัดการชื่อและเก็บลง Storage ทันที
    return newUser
  }, [handleSetUser])

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