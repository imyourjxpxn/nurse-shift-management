'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { getAllWards, Ward } from '@/features/ward/getAllWard'
import { WardListItem } from '@/components/ward//ward-item-list'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [wards, setWards] = useState<Ward[]>([])
  const [isWardLoading, setIsWardLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchWards = async () => {
      try {
        console.log("===========================================")
        const data = await getAllWards()

        console.log("📦 Data received in Home:", data)
        setWards(data)
      } catch (error) {
        console.error("Error fetching wards:", error)
      } finally {
        setIsWardLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchWards()
    }
  }, [isAuthenticated])

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
        {user.displayName}
      </h1>

      <p className="mt-2 text-muted-foreground">
        This is your Nurse Shift Management Home page.
      </p>

      <div className="mt-6 rounded-lg border p-6">
        <p><strong>Hospital:</strong> โรงพยาบาล</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* ✅ Ward List */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Ward List</h2>

        {isWardLoading ? (
          <p>Loading wards...</p>
        ) : wards.length === 0 ? (
          <p>No wards found.</p>
        ) : (
          wards.map((ward) => (
            <WardListItem
              key={ward.wardId}
              ward={ward}
              isHeadNurse={true}
              onEnterWard={(w) => console.log("Enter ward:", w)}
              onDeleteWard={(w) => console.log("Delete ward:", w)}
            />
          ))
        )}
      </div>
    </div>
  )
}