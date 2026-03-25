'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'
import { useAuth } from '@/features/auth/context/auth-context'

export function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex h-20 w-full items-center justify-between px-6">
        <Link href="/home">
          <WaneYenLogo size="sm" />
        </Link>

        <div className="flex items-center gap-6">
        {user && (
          <Link href="/profile">
            <div className="text-slate-700 font-semibold hover:text-sky-600 transition-colors cursor-pointer text-sm">
              {/*  เช็คทั้ง null, undefined และ empty string 
                  ถ้าตัวแปรเป็นค่าว่าง ให้แสดงคำว่า 'ตั้งชื่อผู้ใช้' แทนเสมอ
              */}
              {(user.displayName && user.displayName.trim() !== "") 
                ? user.displayName 
                : "ตั้งชื่อผู้ใช้"}
            </div>
          </Link>
        )}

          {/* ปุ่มออกจากระบบ */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  )
}