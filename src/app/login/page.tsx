'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'
import { GoogleIcon } from '@/components/logo/google-icon'
import { useAuth } from '@features/auth/context/auth-context'



export default function LoginPage() {
  const router = useRouter()
  const { user, loginWithGoogle, isLoading } = useAuth()

  // 1. จัดการการ Redirect อัตโนมัติ
  useEffect(() => {
    // ถ้ายังโหลดไม่เสร็จ หรือ ยังไม่มี user ให้รออยู่ที่หน้านี้ก่อน
    if (isLoading || !user) return

    // ถ้ามี user แล้ว เช็คว่าลงทะเบียนครบหรือยัง
    if (user.profileCompleted) {
      router.replace("/home")
    } else {
      router.replace("/register")
    }
  }, [user, isLoading, router])

  // 2. ถ้ากำลังโหลดข้อมูล หรือมี User อยู่แล้ว (กำลังจะโดนดีดไปหน้าอื่น) 
  // ให้โชว์หน้า Loading แทนที่จะโชว์ปุ่ม Login
  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <WaneYenLogo size="lg" className="animate-pulse" />
      </div>
    )
  }

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
