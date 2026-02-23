"use client"

import { useAuth } from "@/features/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  return null
}