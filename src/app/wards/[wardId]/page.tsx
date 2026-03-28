'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { WardDetail } from '@/features/ward/components/WardDetail'
import { ShiftConfigPanel } from '@/features/ward/components/ShiftConfigPanel'
import { ScheduleTable } from '@/features/ward/components/ScheduleTable'
import { NurseSummaryPanel } from '@/features/ward/components/NurseSummaryPanel'
import { WardDetail as WardDetailType, ShiftTemplate } from '@/features/ward/types'
import { BackButton } from '@/components/navigation/BackButton'
import { getWardById } from '@/features/ward/api/getWardById' 
import { getShiftTemplates } from '@/features/ward/api/getShiftTemplates'
import { useCalendar } from '@/features/ward/hooks/useCalendar'

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const wardId = params.wardId as string
  const { user, isLoading: isAuthLoading } = useAuth()
  const { month, year, monthName, daysInMonth, setMonth, setYear } = useCalendar()

  const [wardData, setWardData] = useState<WardDetailType | null>(null)
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<Record<string, string[][]>>({})

  useEffect(() => {
    async function initPage() {
      if (!wardId) return
      try {
        setLoadingData(true)
        setError(null)
        
        // ✅ ดึงข้อมูล Ward และ Shift Templates พร้อมกัน
        const [ward, templates] = await Promise.all([
          getWardById(wardId),
          getShiftTemplates(wardId)
        ])
        
        setWardData(ward)
        setShiftTemplates(templates || [])

        // ✅ Mock ข้อมูลเริ่มต้น
        const mockData: Record<string, string[][]> = {
          "นางสาวปรียา วรกุล": Array.from({ length: daysInMonth }, (_, i) => i === 0 ? ["ช", "บ", "ด"] : []),
          "นางสาวนพพร สุขใจ": Array.from({ length: daysInMonth }, (_, i) => i === 0 ? ["ด"] : []),
        }
        setSchedule(mockData)

      } catch (err: any) {
        console.error("Fetch Error:", err)
        setError(err.message || "ไม่สามารถโหลดข้อมูลได้")
      } finally {
        setLoadingData(false)
      }
    }
    initPage()
  }, [wardId, daysInMonth])

  if (isAuthLoading || loadingData) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 animate-pulse">กำลังโหลดข้อมูล...</div>
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
        ward={wardData} month={monthName} year={year.toString()}
        onMonthChange={setMonth} onYearChange={setYear}
        currentMonthIdx={month} currentYear={year}
      />

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          {/* ✅ ส่ง templates ลงไปให้ Panel */}
          <ShiftConfigPanel isEditable={isHeadNurse} templates={shiftTemplates} />
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
              if (isHeadNurse) console.log(`Edit ${nurseId} Day ${day + 1}`)
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
    <div className="flex items-center gap-2">
      <div className={`w-3.5 h-3.5 rounded border ${color} border-slate-200`} />
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  )
}