'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { WardDetail } from '@/features/ward/components/WardDetail'
import { ShiftConfigPanel } from '@/features/ward/components/ShiftConfigPanel'
import { ScheduleTable } from '@/features/ward/components/ScheduleTable'
import { NurseSummaryPanel } from '@/features/ward/components/NurseSummaryPanel'
import { WardDetail as WardDetailType } from '@/features/ward/types'
import { BackButton } from '@/components/navigation/BackButton'
import { getWardById } from '@/features/ward/api/getWardById' 

// นำเข้า Hook สำหรับจัดการปฏิทิน
import { useCalendar } from '@/features/ward/hooks/useCalendar'

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const wardId = params.wardId as string
  const { user, isLoading: isAuthLoading } = useAuth()

  // ✅ ดึง Logic ปฏิทินมาใช้
  const { month, year, monthName, daysInMonth, setMonth, setYear } = useCalendar()

  const [wardData, setWardData] = useState<WardDetailType | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCell, setSelectedCell] = useState<{ nurseId: string, day: number } | null>(null)
  
  // Mock Schedule (ในอนาคตจะใช้ useEffect ดึงตาม month/year)
  const [schedule, setSchedule] = useState<Record<string, string[][]>>({
    "นางสาวปรียา วรกุล": Array.from({ length: 31 }, () => []),
    "นางสาวนพพร สุขใจ": Array.from({ length: 31 }, () => []),
  })

  useEffect(() => {
    async function initPage() {
      if (!wardId) return
      try {
        setLoadingData(true)
        setError(null)
        const data = await getWardById(wardId)

        // 🚀 แทรก Log ตรงนี้ครับ 🚀
        console.log("=== DEBUG WARD DATA ===")
        console.log("Full Object:", data)
        console.log("Role from Backend:", data.userRole)
        console.log("========================")

        setWardData(data)
      } catch (err: any) {
        console.error("Fetch Ward Error:", err)
        setError(err.message || "ไม่สามารถโหลดข้อมูลวอร์ดได้")
      } finally {
        setLoadingData(false)
      }
    }
    initPage()
  }, [wardId])

  if (isAuthLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลวอร์ด...</div>
      </div>
    )
  }

  if (error || !wardData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="text-blue-500 underline">กลับหน้าหลัก</button>
      </div>
    )
  }

  const isHeadNurse = wardData.userRole === 'head_nurse'

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <BackButton />
      
      {/* ✅ 1. ส่งค่าจาก useCalendar ไปที่ WardDetail */}
      <WardDetail 
        ward={wardData}
        month={monthName} // แสดงชื่อเดือนภาษาไทยที่คำนวณจาก Hook
        year={year.toString()} // แสดงปีที่เลือกจาก Hook
        onMonthChange={setMonth} // ส่งฟังก์ชันไปให้ Dropdown เรียกใช้
        onYearChange={setYear}
        currentMonthIdx={month}
        currentYear={year}
      />

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <ShiftConfigPanel isEditable={isHeadNurse} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg mb-3">จัดตารางเวรพยาบาล</h3>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <LegendItem color="bg-sky-100" label="เวรเช้า : ช" />
              <LegendItem color="bg-orange-100" label="เวรบ่าย : บ" />
              <LegendItem color="bg-violet-100" label="เวรดึก : ด" />
              <LegendItem color="bg-rose-100" label="Emergency : E" />
              <LegendItem color="bg-slate-100" label="ล : ลา" />
              <LegendItem color="bg-green-100" label="o : off" />
            </div>
          </div>

          {/* ✅ 2. ส่ง daysInMonth ไปให้ตารางสร้าง Column ตามจำนวนวันจริง */}
          <ScheduleTable
            daysInMonth={daysInMonth}
            schedule={schedule}
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) setSelectedCell({ nurseId, day })
            }}
          />
        </div>
      </div>

      <NurseSummaryPanel schedule={schedule} />
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className={`w-3.5 h-3.5 rounded border ${color} border-slate-200`} />
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  )
}