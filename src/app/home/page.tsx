'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { WardListItem } from '@/features/ward/components/WardItemList'
import { JoinWardModal } from '@/features/ward/components/openJoinModal'
import { HospitalCard } from '@/features/Hospital/components/hospital-card'

import { useAuth } from '@/features/auth/context/auth-context'
import type { Ward } from '@/features/ward/types'

import { enterWard } from '@/features/ward/api/enterWard'
import { joinWard } from '@/features/ward/api/JoinWard'
import { getAllWards } from '@/features/ward/api/getAllWard'
import { getUserHospital } from '@/features/Hospital/api/getUserHospital'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [hospitalInfo, setHospitalInfo] = useState<{ id: string; name: string } | null>(null)
  const [isHospitalLoading, setIsHospitalLoading] = useState(true)
  const [wards, setWards] = useState<Ward[]>([])
  const [isWardLoading, setIsWardLoading] = useState(true)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  // 1. ตรวจสอบสิทธิ์การเข้าถึง (ถ้าไม่ล็อกอิน ดีดออก)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // 2. โหลดข้อมูล Hospital และ Wards (ใช้ State Loading แยกตามที่คุณประกาศไว้)
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    const fetchData = async () => {
      // โหลด Hospital
      try {
        setIsHospitalLoading(true)
        const hData = await getUserHospital()
        setHospitalInfo({ id: hData.hospitalId, name: hData.name })
      } catch (error) {
        console.error("Fetch hospital error:", error)
      } finally {
        setIsHospitalLoading(false)
      }

      // โหลด Wards
      try {
        setIsWardLoading(true)
        const wData = await getAllWards()
        setWards(wData)
      } catch (error) {
        console.error("Error fetching wards:", error)
      } finally {
        setIsWardLoading(false)
      }
    }

    fetchData()
  }, [isLoading, isAuthenticated, user])

  // 3. Logic การเข้าวอร์ด
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

  // 4. Logic การ Join วอร์ด (ใช้ joinWard API ที่ import มา)
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

  // ป้องกันหน้า Flash กรณีโหลด Auth
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading Auth...</div>
  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-full p-8 pt-12 mx-auto">
        {/* ส่วน Hospital Card */}
        <div className="w-full mb-12">
          <HospitalCard 
            hospitalName={isHospitalLoading ? 'กำลังโหลด...' : (hospitalInfo?.name || 'ไม่พบข้อมูล')}
            onCreateWard={() => console.log('Open Create Modal')} 
          />
        </div>

        {/* รายการวอร์ด */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">รายการวอร์ดของคุณ</h2>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            {isWardLoading ? (
              // Skeleton Loading
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : wards.length === 0 ? (
              <p className="text-slate-400 py-10 text-center border rounded-2xl border-dashed">
                ไม่มีวอร์ดในโรงพยาบาลนี้
              </p>
            ) : (
              wards.map((ward) => (
                <WardListItem
                  key={ward.wardId}
                  ward={ward}
                  isHeadNurse={ward.createdBy === user.userId} // ใช้ user.userId จาก AuthContext
                  onEnterWard={handleEnterWard} // ใช้ handleEnterWard ที่มี Logic เข้า/จอย
                  onDeleteWard={(w) => console.log('Delete:', w.wardName)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal จอยวอร์ด */}
      <JoinWardModal
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        wardName={selectedWard?.wardName || ''}
        onJoinWard={handleJoinWardAction} // ใช้ handleJoinWardAction ที่มี Logic เรียก API
      />
    </div>
  )
}