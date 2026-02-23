'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Welcome, {user.displayName} 👩🏻‍⚕️
      </h1>

      <p className="mt-2 text-muted-foreground">
        This is your Nurse Shift Management Home page.
      </p>

      <div className="mt-6 rounded-lg border p-6">
        <p><strong>Hospital:</strong> {"โรงพยาบาล"}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  )
}