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
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/home">
          <WaneYenLogo size="sm" />
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{user.displayName}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>
  )
}
