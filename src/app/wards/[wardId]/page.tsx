'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { WardDetail } from '@/features/ward/components/WardDetail'
import { ShiftConfigPanel } from '@/features/ward/components/ShiftConfigPanel'
import { ScheduleTable } from '@/features/ward/components/ScheduleTable'
import { NurseSummaryPanel } from '@/features/ward/components/NurseSummaryPanel'
import { WardDetail as WardDetailType } from '@/features/ward/types'

export default function SchedulePage() {
  const params = useParams()
  const wardId = params.wardId as string
  const { user, isLoading: isAuthLoading } = useAuth()

  const [wardData, setWardData] = useState<WardDetailType | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [selectedCell, setSelectedCell] = useState<{nurseId: string, day: number} | null>(null)
  
  const [schedule, setSchedule] = useState<Record<string, string[][]>>({
    "นางสาวปรียา วรกุล": Array.from({ length: 31 }, () => []),
    "นางสาวนพพร สุขใจ": Array.from({ length: 31 }, () => []),
  })

  useEffect(() => {
    async function initPage() {
      if (!wardId) return
      try {
        setLoadingData(true)
        const mockData: WardDetailType = {
          wardId: wardId,
          wardName: "อายุรกรรมชาย (Med ชาย)",
          hospitalId: "hosp_001",
          joinCode: "CodeBRIX36924",
          joinCodeStatus: "ACTIVE",
          status: "OPEN",
          createdBy: "user_123", 
          updatedBy: "user_123"
        }
        setWardData(mockData)
      } finally {
        setLoadingData(false)
      }
    }
    initPage()
  }, [wardId])

  if (isAuthLoading || loadingData || !wardData) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลวอร์ด...</div>
  }

  const isHeadNurse = user?.userId === wardData.createdBy

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* 1. ส่วน Header (ชื่อวอร์ด, เดือน, ปี) */}
      <WardDetail 
        ward={wardData}
        hospitalName="อินทร์บุรี"
        userId={user?.userId || ""}
        month="มกราคม"
        year="2026"
      />

      <div className="space-y-6">
        
        {/* ✅ 2.1 ShiftConfigPanel (จำนวนพยาบาล & เวลา) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <ShiftConfigPanel isEditable={isHeadNurse} />
        </div>

        {/* ✅ 2.2 Card ตารางจัดเวร (รวมหัวข้อ + Legend + ตาราง) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg mb-3">จัดตารางเวรพยาบาล</h3>
            
            {/* Legend ย้ายมาอยู่ตรงนี้ เป็น Text ใต้หัวข้อ */}
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
            schedule={schedule}
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) setSelectedCell({ nurseId, day })
            }}
          />
        </div>
      </div>

      {/* 3. สรุปเวรรายบุคคลด้านล่าง */}
      <NurseSummaryPanel schedule={schedule} />

    </div>
  )
}

// Component ย่อยสำหรับ Legend (ปรับขนาดให้เล็กลงกะทัดรัดขึ้น)
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className={`w-3.5 h-3.5 rounded border ${color} border-slate-200`} />
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  )
}