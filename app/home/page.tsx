'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { WardListItem } from '@/components/ward/WardItemList'
import { JoinWardModal } from '@/components/modals/openJoinModal'
import { HospitalCard } from '@/components/hospital-card'

import { useAuth } from '@/features/auth/auth-context'
import type { Ward } from '@/features/ward/types'

import { enterWard } from '@/features/ward/enterWard'
import { joinWard } from '@/features/ward/JoinWard'
import { getAllWards } from '@/features/ward/getAllWard'
import { getUserHospital } from '@/features/Hospital/getUserHospital'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [hospitalInfo, setHospitalInfo] = useState<{ id: string; name: string } | null>(null)
  const [isHospitalLoading, setIsHospitalLoading] = useState(true)
  const [wards, setWards] = useState<Ward[]>([])
  const [isWardLoading, setIsWardLoading] = useState(true)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  // 1. โหลดข้อมูล Hospital เพื่อเอา hospitalId
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const fetchHospital = async () => {
        try {
          setIsHospitalLoading(true)
          const data = await getUserHospital()
          // เก็บทั้ง ID และ Name
          setHospitalInfo({ id: data.hospitalId, name: data.name }) 
        } catch (error) {
          console.error("Fetch hospital error:", error)
        } finally {
          setIsHospitalLoading(false)
        }
      }
      fetchHospital()
    }
  }, [isLoading, isAuthenticated])

  // 2. โหลดรายการวอร์ด (เรียกได้เลย ไม่ต้องรอ hospitalId)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const fetchWards = async () => {
        try {
          setIsWardLoading(true)
          // ✅ เรียกใช้แบบไม่ต้องส่ง parameter ตามที่แก้ในข้อ 1
          const data = await getAllWards()
          setWards(data)
        } catch (error) {
          console.error("Error fetching wards:", error)
        } finally {
          setIsWardLoading(false)
        }
      }
      fetchWards()
    }
  }, [isLoading, isAuthenticated])

  // 3. Logic การเข้า/จอยวอร์ด (เหมือนเดิม)
  const handleEnterWard = async (ward: Ward) => {
    try {
      const data = await enterWard(ward.wardId)
      if (data.isMember) {
        router.push(`/wards/${ward.wardId}`)
      } else {
        setSelectedWard(ward)
        setIsJoinOpen(true)
      }
    } catch (err) {
      console.error("Enter ward error:", err)
      alert('ไม่สามารถตรวจสอบสิทธิ์เข้าวอร์ดได้')
    }
  }

  const handleJoinWardAction = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!selectedWard) return { success: false, error: 'ไม่พบวอร์ด' }
    try {
      await joinWard(selectedWard.wardId, code)
      const data = await enterWard(selectedWard.wardId)
      if (data.isMember) {
        setIsJoinOpen(false)
        router.push(`/wards/${selectedWard.wardId}`)
        return { success: true }
      }
      return { success: false, error: 'ยังไม่มีสิทธิ์เข้าถึง' }
    } catch (error: any) {
      return { success: false, error: error.message || 'รหัสไม่ถูกต้อง' }
    }
  }

  if (isLoading || isHospitalLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-full p-8 pt-12 mx-auto">
        <div className="w-full mb-12">
          <HospitalCard 
            hospitalName={hospitalInfo?.name || 'กำลังโหลด...'}
            onCreateWard={() => console.log('Open Create Modal')} 
          />
        </div>

        <div className="w-full space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">รายการวอร์ดของคุณ</h2>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {isWardLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : wards.length === 0 ? (
              <p className="text-slate-400 py-10 text-center border rounded-2xl border-dashed">ไม่มีวอร์ดในโรงพยาบาลนี้</p>
            ) : (
              wards.map((ward) => (
                <WardListItem
                  key={ward.wardId}
                  ward={ward}
                  isHeadNurse={ward.createdBy === user.userId}
                  onEnterWard={handleEnterWard}
                  onDeleteWard={(w) => console.log('Delete:', w.wardName)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <JoinWardModal
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        wardName={selectedWard?.wardName || ''}
        onJoinWard={handleJoinWardAction}
      />
    </div>
  )
}