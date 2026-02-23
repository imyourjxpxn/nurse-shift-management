'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { WardListItem } from '@/components/ward/ward-item-list'
import { JoinWardModal } from '@/components/modals/openJoinModal'

import { useAuth } from '@/features/auth/auth-context'
import type { Ward } from '@/features/ward/types'

import { enterWard } from '@/features/ward/enterWard'
import { joinWard } from '@/features/ward/JoinWard'
import { getAllWards } from '@/features/ward/getAllWard'
import { getUserHospital } from '@/features/Hospital/getUserHospital'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  // ✅ ต้องอยู่ใน component เท่านั้น
  const [hospitalName, setHospitalName] = useState<string>('')
  const [isHospitalLoading, setIsHospitalLoading] = useState(true)

  const [wards, setWards] = useState<Ward[]>([])
  const [isWardLoading, setIsWardLoading] = useState(true)

  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  // ===============================
  // โหลด Hospital
  // ===============================
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const fetchHospital = async () => {
        try {
          const data = await getUserHospital()
          setHospitalName(data.name)
        } catch (error) {
          console.error('Error fetching hospital:', error)
        } finally {
          setIsHospitalLoading(false)
        }
      }

      fetchHospital()
    }
  }, [isLoading, isAuthenticated])

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
    if (!isLoading && isAuthenticated) {
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

      fetchWards()
    }
  }, [isLoading, isAuthenticated])

  // ===============================
  // Enter Ward
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
      <div className="min-h-screen p-8">

        {/* Hospital Card */}
        <div className="mt-1">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r 
                          from-sky-200 to-sky-300 
                          px-12 py-24 md:py-10">

            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-sky-700">
                {isHospitalLoading ? 'Loading hospital...' : hospitalName}
              </h1>

              <button
                className="mt-8 rounded-xl bg-white/80 px-6 py-3 
                           font-medium text-blue-700 shadow-sm
                           backdrop-blur transition hover:bg-white"
              >
                + Create Ward
              </button>
            </div>

          </div>
        </div>

        {/* Ward List */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">รายการวอร์ด</h2>

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

      {/* Join Modal */}
      <JoinWardModal
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        wardName={selectedWard?.wardName || ''}
        onJoinWard={async (code) => {
          if (!selectedWard) {
            return { success: false, error: 'ไม่พบวอร์ด' }
          }

          try {
            await joinWard(selectedWard.wardId, code)
            const data = await enterWard(selectedWard.wardId)

            if (data.isMember) {
              setIsJoinOpen(false)
              router.push(`/wards/${selectedWard.wardId}`)
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