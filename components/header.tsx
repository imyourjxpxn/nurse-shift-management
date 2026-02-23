'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'
import { useAuth } from '@/features/auth/auth-context'

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
        <span className="text-sm font-semibold text-gray-800">
          {user.displayName}
        </span>
      )}

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
