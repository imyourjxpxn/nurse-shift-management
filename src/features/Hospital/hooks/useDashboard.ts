import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { Ward } from '../../ward/types'
import { getAllWards } from '../../ward/api/getAllWard'
import { getUserHospital } from '@/features/Hospital/api/getUserHospital'
import { enterWard } from '../../ward/api/enterWard'
import { joinWard } from '../../ward/api/JoinWard'

export function useDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [hospitalInfo, setHospitalInfo] = useState<{ id: string; name: string } | null>(null)
  const [wards, setWards] = useState<Ward[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // ฟังก์ชันโหลดข้อมูล (ตัวที่คุณถามถึง)
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setIsDataLoading(true)
      const [hData, wData] = await Promise.all([
        getUserHospital(),
        getAllWards()
      ])
      setHospitalInfo({ id: hData.hospitalId, name: hData.name })
      setWards(wData)
    } catch (error) {
      console.error("Dashboard Load Error:", error)
    } finally {
      setIsDataLoading(false)
    }
  }, [isAuthenticated])

  // จัดการการเข้าวอร์ด
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
      alert('ไม่สามารถตรวจสอบสิทธิ์เข้าวอร์ดได้')
    }
  }

 // จัดการการ Join วอร์ด
const handleJoinWardAction = async (code: string) => {
  if (!selectedWard) return { success: false, error: 'ไม่พบวอร์ดที่เลือก' }

  try {
    // 1. ยิง API Join วอร์ด
    await joinWard(selectedWard.wardId, code)

    // 2. ถ้าผ่าน: โหลดข้อมูลใหม่ (เพื่ออัปเดตสถานะสมาชิก)
    await loadDashboardData()
    
    // 3. ปิด Modal และพาเข้าหน้าวอร์ด
    setIsJoinOpen(false)
    router.push(`/wards/${selectedWard.wardId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Join Ward Error Details:", error)

    /**
     * 🛑 ดักจับ Error จาก Backend
     * ถ้า Backend ส่ง 400 มา หรือ error message มีคำว่า 'Invalid'
     */
    let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'

    if (error.message.includes('400') || error.message.toLowerCase().includes('invalid')) {
      errorMessage = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองอีกครั้ง'
    } else if (error.message.toLowerCase().includes('already')) {
      errorMessage = 'คุณเป็นสมาชิกของวอร์ดนี้อยู่แล้ว'
    } else {
      // กรณีอื่นๆ เช่น Server 500 หรือเน็ตหลุด
      errorMessage = error.message || 'ไม่สามารถเข้าร่วมวอร์ดได้ในขณะนี้'
    }

    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthLoading, isAuthenticated, loadDashboardData])

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    hospitalInfo,
    wards,
    isDataLoading,
    selectedWard,
    isJoinOpen, setIsJoinOpen,
    isCreateOpen, setIsCreateOpen,
    loadDashboardData,
    handleEnterWard,
    handleJoinWardAction
  }
}