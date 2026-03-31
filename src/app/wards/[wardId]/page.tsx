'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// Components
import { WardDetail } from '@/features/ward/components/WardDetail'
import { ShiftConfigPanel } from '@/features/ward/components/ShiftConfigPanel'
import { ScheduleTable } from '@/features/ward/components/ScheduleTable'
import { NurseSummaryPanel } from '@/features/ward/components/NurseSummaryPanel'
import { ValidationErrorSidebar } from '@/features/ward/components/ValidationErrorSidebar'
import { BackButton } from '@/components/navigation/BackButton'

// Hooks
import { useCalendar } from '@/features/ward/hooks/useCalendar'
import { useShiftValidation } from '@/features/ward/hooks/useShiftTempValidation'
import { useScheduleData } from '@/features/ward/hooks/useScheduleData'
import { useSaveConfig } from '@/features/ward/hooks/useSaveConfig'

export default function SchedulePage() {
  const { wardId } = useParams() as { wardId: string }
  
  // 🚩 ดึงข้อมูลปฏิทิน
  const { 
    month, 
    year, 
    monthName, 
    daysInMonth, 
    setMonth, 
    setYear 
  } = useCalendar()

  // State สำหรับเก็บข้อมูลที่ Sync มาจาก ShiftCard
  const [configData, setConfigData] = useState<Record<string, any>>({})

  // 1. 🚩 จัดการข้อมูลหลัก
  const { 
    wardData, 
    shiftTemplates, 
    loadingData, 
    schedule, 
    refresh 
  } = useScheduleData(wardId, daysInMonth, month, year)
  
  // 2. 🚩 จัดการ Validation
  const { isValid, messages } = useShiftValidation(configData)

  // 3. 🚩 จัดการการบันทึก (รับค่า showSuccessToast เพิ่มเข้ามา)
  const { 
    isSaving, 
    showSuccessToast,
    validationErrors, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    handleSave 
  } = useSaveConfig({
    wardId, 
    isFormValid: isValid, 
    validationMsg: messages 
  })

  // Loading State
  if (loadingData && shiftTemplates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-400 text-sm">กำลังโหลดข้อมูลวอร์ด...</p>
        </div>
      </div>
    )
  }

  const isHeadNurse = wardData?.userRole === 'head_nurse'

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative overflow-x-hidden text-slate-900">
      <BackButton />
      
      {/* ✅ Status UI: Loading & Success Toast */}
      {isSaving && <ToastSaving />}
      {showSuccessToast && <ToastSuccess />}

      <ValidationErrorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        errors={validationErrors} 
      />

      {/* ✅ ส่วนหัววอร์ด และปุ่มบันทึก */}
      <WardDetail 
        ward={wardData!} 
        month={monthName} 
        year={year.toString()}
        onMonthChange={setMonth} 
        onYearChange={setYear}
        currentMonthIdx={month} 
        currentYear={year}
        onSave={() => handleSave(configData, refresh)} 
      />

      <div className="space-y-6">
        {/* ✅ ส่วนตั้งค่าเวร (เช้า/บ่าย/ดึก) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <ShiftConfigPanel 
            isEditable={isHeadNurse}
            templates={shiftTemplates}
            onDataSync={(type, data) => setConfigData(prev => ({ ...prev, [type]: data }))}
          />
        </div>

        {/* ✅ ส่วนตารางจัดเวรรายวัน */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg mb-3 tracking-tight">
              จัดตารางเวรพยาบาล (เดือน{monthName})
            </h3>
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
            schedule={schedule || {}} 
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) console.log(`กำลังแก้ไข: ${nurseId} วันที่ ${day + 1}`)
            }}
          />
        </div>
      </div>

      {/* ✅ สรุปจำนวนเวรของพยาบาลแต่ละคน */}
      <NurseSummaryPanel schedule={schedule || {}} />

      {/* ✅ Floating Button: ปรับปรุงให้ไม่เด้งและไม่เรืองแสง */}
      {validationErrors.length > 0 && !isSidebarOpen && (
        <FloatingErrorBtn 
          count={validationErrors.length} 
          onClick={() => setIsSidebarOpen(true)} 
        />
      )}
    </div>
  )
}

// --- Internal UI Components ---

function ToastSaving() {
  return (
    <div className="fixed top-10 right-10 z-[9999] bg-white border-2 border-blue-500 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-black text-blue-600 text-sm">กำลังบันทึกข้อมูล...</span>
    </div>
  )
}

function ToastSuccess() {
  return (
    <div className="fixed top-30 right-10 z-[9999] bg-emerald-400 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="bg-white/20 p-1 rounded-full">
        <CheckCircle2 size={20} strokeWidth={3} />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm">บันทึกข้อมูลเรียบร้อย</span>
      </div>
    </div>
  )
}

function FloatingErrorBtn({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="fixed bottom-10 right-10 bg-red-500 text-white p-4 rounded-full shadow-md z-50 hover:scale-105 transition-transform active:scale-95"
    >
      <div className="absolute -top-1 -right-1 bg-white text-red-500 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-500">
        {count}
      </div>
      <AlertCircle size={24} />
    </button>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3.5 h-3.5 rounded border ${color} border-slate-200 shadow-sm`} />
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
    </div>
  )
}