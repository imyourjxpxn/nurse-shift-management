import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { Ward } from '../types'
import { getAllWards } from '../api/getAllWard'
import { getUserHospital } from '@/features/Hospital/api/getUserHospital'
import { enterWard } from '../api/enterWard'
import { joinWard } from '../api/JoinWard'

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
    if (!selectedWard) return { success: false, error: 'ไม่พบวอร์ด' }
    try {
      await joinWard(selectedWard.wardId, code)
      await loadDashboardData()
      setIsJoinOpen(false)
      router.push(`/wards/${selectedWard.wardId}`)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'รหัสไม่ถูกต้อง' }
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