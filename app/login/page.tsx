'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'
import { GoogleIcon } from '@/components/logo/google-icon'
import { useAuth } from '@/features/auth/auth-context'



export default function LoginPage() {
  const router = useRouter()
  const { user, loginWithGoogle, isLoading } = useAuth()

  console.log("isLoading:", isLoading)
  console.log("user:", user)

  // ✅ 1️⃣ เช็คกรณี redirect กลับมาจาก Google
  useEffect(() => {
  if (isLoading) return
  if (!user) return

  if (user.profileCompleted) {
    router.replace("/home")
  } else {
    router.replace("/register")
  }

}, [user, isLoading])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <WaneYenLogo size="lg" />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium italic text-foreground">
            ช่วยให้คุณจัดตารางเวรพยาบาลได้ง่ายขึ้น
          </h1>
          <p className="text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </div>

        <Button
          variant="outline"
          className="h-12 w-full max-w-sm gap-3 rounded-full border-border bg-background text-foreground shadow-sm hover:bg-muted"
          onClick={loginWithGoogle}
          disabled={isLoading}
        >
          <GoogleIcon className="size-5" />
          <span className="font-medium">
            Continue with Google
          </span>
        </Button>


      </div>
    </main>
  )
}
