'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Header } from '@/components/header'
import { WardListItem } from '@/components/ward/ward-item-list'
import { JoinWardModal } from '@/components/modals/openJoinModal'

import { useAuth } from '@/features/auth/auth-context'
import type { Ward } from '@/features/ward/types'

import { enterWard } from '@/features/ward/enterWard'
import { joinWard } from '@/features/ward/JoinWard'
import { getAllWards } from '@/features/ward/getAllWard'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [wards, setWards] = useState<Ward[]>([])
  const [isWardLoading, setIsWardLoading] = useState(true)

  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  // ===============================
  // กด Enter Ward
  // ===============================
  const handleEnterWard = async (ward: Ward) => {
  try {
    const data = await enterWard(ward.wardId)

    if (data.isMember) {
      router.push(`/ward/${ward.wardId}`)
    } else {
      setSelectedWard(ward)
      setIsJoinOpen(true)
    }

  } catch (err) {
    console.error(err)
    alert('Something went wrong')
  }
}

  // ===============================
  // Redirect ถ้ายังไม่ login
  // ===============================
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // ===============================
  // โหลด Ward ทั้งหมด
  // ===============================
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const data = await getAllWards()
        setWards(data)
      } catch (error) {
        console.error('Error fetching wards:', error)
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
    <>
      <Header />

      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">{user.displayName}</h1>

        <p className="mt-2 text-muted-foreground">
          This is your Nurse Shift Management Home page.
        </p>

        <div className="mt-6 rounded-lg border p-6">
          <p>
            <strong>Hospital:</strong> โรงพยาบาล
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {/* Ward List */}
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
                onEnterWard={handleEnterWard}
                onDeleteWard={(w) => console.log('Delete ward:', w)}
              />
            ))
          )}
        </div>
      </div>

      {/* =============================== */}
      {/* Join Modal */}
      {/* =============================== */}
              <JoinWardModal
                    open={isJoinOpen}
                    onOpenChange={setIsJoinOpen}
                    wardName={selectedWard?.wardName || ''}
                    onJoinWard={async (code) => {
              if (!selectedWard) {
                return { success: false, error: 'ไม่พบวอร์ด' }
              }

              try {
                // 1️⃣ join ก่อน
                await joinWard(selectedWard.wardId, code)

                // 2️⃣ re-check membership
                const data = await enterWard(selectedWard.wardId)

                if (data.isMember) {
                  setIsJoinOpen(false)
                  router.push(`/ward/${selectedWard.wardId}`)
                  return { success: true }
                }

                return { success: false, error: 'เข้าวอร์ดไม่สำเร็จ' }

              } catch (error: any) {
                return {
                  success: false,
                  error: error.message || 'รหัสไม่ถูกต้อง',
                }
              }
            }}
      />
    </>
  )
}