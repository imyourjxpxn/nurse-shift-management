'use client'

import { useEffect, useCallback, useState, createContext, useContext, useMemo, type ReactNode } from 'react'
import { useRouter } from "next/navigation"
import * as authService from '@/features/auth/api/auth-service'
import type { User, CompleteRegistrationPayload } from '@/features/user/types'

// เพิ่ม displayName เข้าไปใน interface ของ Context เพื่อให้เรียกใช้ได้โดยไม่พัง
interface AuthContextType {
  user: (User & { displayName: string }) | null
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
   * 1. ฟังก์ชันคำนวณ displayName แบบ Memoized 
   * จะทำงานใหม่เฉพาะเมื่อข้อมูล user เปลี่ยนเท่านั้น
   */
  const displayName = useMemo(() => {
    if (!user) return null
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ตั้งชื่อผู้ใช้'
  }, [user])

  /**
   * 2. ฟังก์ชันจัดการข้อมูล User เข้า State และ Storage
   * เก็บเฉพาะข้อมูลตาม User Type จริง (ไม่มี displayName)
   */
  const handleSetUser = useCallback((userData: User | null) => {
    if (userData) {
      setUser(userData)
      authService.persistUser(userData)
    } else {
      setUser(null)
      authService.clearPersistedUser()
    }
  }, [])

  /**
   * 3. ฟังก์ชันโหลดข้อมูล User จาก API
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
   * 4. Initial Load
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
   * 5. ออกจากระบบ
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      handleSetUser(null)
      router.replace("/login")
    }
  }, [handleSetUser, router])

  /**
   * 6. รีเฟรชข้อมูล (เรียกใช้จากหน้า Profile หลังบันทึกสำเร็จ)
   */
  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  /**
   * 7. ลงทะเบียนเพิ่มเติม
   */
  const completeRegistration = useCallback(async (p: CompleteRegistrationPayload) => {
    const newUser = await authService.completeRegistration(p)
    handleSetUser(newUser)
    return newUser
  }, [handleSetUser])

  return (
    <AuthContext.Provider value={{ 
      // ส่ง user ออกไปพร้อมกับแนบ displayName เข้าไปด้วย
      user: user ? { ...user, displayName: displayName! } : null,
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