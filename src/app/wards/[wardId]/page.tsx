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
import { useCalendar } from '@/features/ward/hooks/useCalendar'

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const wardId = params.wardId as string
  const { user, isLoading: isAuthLoading } = useAuth()
  const { month, year, monthName, daysInMonth, setMonth, setYear } = useCalendar()

  const [wardData, setWardData] = useState<WardDetailType | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ nurseId: string, day: number } | null>(null)
  
  // ✅ แก้ไข Mock Schedule ให้เป็นรูปแบบ [ ["ช", "บ"], ["ด"], ["o"] ]
  const [schedule, setSchedule] = useState<Record<string, string[][]>>({})

  useEffect(() => {
    async function initPage() {
      if (!wardId) return
      try {
        setLoadingData(true)
        setError(null)
        const data = await getWardById(wardId)
        setWardData(data)

        // ✅ Mock ข้อมูลเริ่มต้นตามจำนวนวันในเดือนนั้นๆ
        const mockData: Record<string, string[][]> = {
          "นางสาวปรียา วรกุล": Array.from({ length: daysInMonth }, (_, i) => {
            if (i === 0) return ["ช", "บ", "ด"] // วันแรกควง 3 เวร
            if (i === 1) return ["o"]           // วันสองหยุด
            if (i === 2) return ["ช"]           // วันสามเช้า
            return []
          }),
          "นางสาวนพพร สุขใจ": Array.from({ length: daysInMonth }, (_, i) => {
            if (i === 0) return ["ด"]
            if (i === 3) return ["E"]           // วันที่สี่เวรฉุกเฉิน
            return []
          }),
        }
        setSchedule(mockData)

      } catch (err: any) {
        console.error("Fetch Ward Error:", err)
        setError(err.message || "ไม่สามารถโหลดข้อมูลวอร์ดได้")
      } finally {
        setLoadingData(false)
      }
    }
    initPage()
  }, [wardId, daysInMonth]) // เพิ่ม daysInMonth เพื่อให้ล้างค่าเมื่อเปลี่ยนเดือน

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
      
      <WardDetail 
        ward={wardData}
        month={monthName}
        year={year.toString()}
        onMonthChange={setMonth}
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

          <ScheduleTable
            daysInMonth={daysInMonth}
            schedule={schedule}
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) {
                console.log(`เปิด Modal สำหรับ ${nurseId} วันที่ ${day + 1}`);
                setSelectedCell({ nurseId, day });
              }
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