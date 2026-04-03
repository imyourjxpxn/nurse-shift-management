'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

// Components - Core
import { WardDetail } from '@/features/ward/components/WardDetail'
import { ShiftConfigPanel } from '@/features/ward/components/ShiftConfigPanel'
import { ScheduleTable } from '@/features/ward/components/ScheduleTable'
import { SelectShiftModal } from '@/features/ward/components/ScheduleModal/SelectShiftModal'
import { NurseSummaryPanel } from '@/features/ward/components/NurseSummaryPanel'
import { ValidationErrorSidebar } from '@/features/ward/components/ValidationErrorSidebar'
import { BackButton } from '@/components/navigation/BackButton'

// Components - UI Extras
import { 
  ToastSaving, 
  ToastSuccess, 
  FloatingErrorBtn, 
  LegendItem 
} from '@/features/ward/components/ScheduleUIExtras'

// Hooks
import { useCalendar } from '@/features/ward/hooks/useCalendar'
import { useShiftValidation } from '@/features/ward/hooks/useShiftTempValidation'
import { useScheduleData } from '@/features/ward/hooks/useScheduleData'
import { useSaveConfig } from '@/features/ward/hooks/useSaveConfig'
import { useScheduleModal } from '@/features/ward/hooks/useScheduleModal'

export default function SchedulePage() {
  const { wardId } = useParams() as { wardId: string }
  
  // 1. จัดการเรื่องเวลาและปฏิทิน
  const { 
    month, year, monthName, daysInMonth, setMonth, setYear 
  } = useCalendar()

  // 2. จัดการข้อมูลหลักของตาราง
  const { 
    wardData, shiftTemplates, loadingData, scheduleRows, refresh 
  } = useScheduleData(wardId, daysInMonth, month, year)

  // 3. จัดการ Modal Logic (ส่ง refresh เข้าไปเพื่อให้กดลบแล้วตารางอัปเดตทันที)
  const modal = useScheduleModal(scheduleRows, refresh)

  // 4. State สำหรับข้อมูลที่รอการบันทึก
  const [configData, setConfigData] = useState<Record<string, any>>({})
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([])

  // 5. Validation & Saving Logic
  const { isValid, messages } = useShiftValidation(configData)
  const { 
    isSaving, showSuccessToast, validationErrors, 
    isSidebarOpen, setIsSidebarOpen, handleSave 
  } = useSaveConfig({
    wardId, year, month,
    isFormValid: isValid, 
    validationMsg: messages 
  })

  // --- Loading State ---
  if (loadingData && Object.keys(scheduleRows).length === 0) {
    return <LoadingSpinner />
  }

  const isHeadNurse = wardData?.userRole === 'head_nurse'

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative overflow-x-hidden text-slate-900">
      <BackButton />
      
      {/* Status UI */}
      {isSaving && <ToastSaving />}
      {showSuccessToast && <ToastSuccess />}

      <ValidationErrorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        errors={validationErrors} 
      />

      {/* Header & Save Button */}
      {wardData && (
        <WardDetail 
          ward={wardData} 
          month={monthName} 
          year={year.toString()}
          onMonthChange={setMonth} 
          onYearChange={setYear}
          currentMonthIdx={month} 
          currentYear={year}
          onSave={() => handleSave(configData, pendingAssignments, () => {
            setPendingAssignments([]); // ล้างค่าที่รอค้างไว้หลังเซฟสำเร็จ
            refresh();
          })} 
        />
      )}

      <div className="space-y-6">
        {/* ส่วนตั้งค่าโควตาเวร */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <ShiftConfigPanel 
            isEditable={isHeadNurse}
            templates={shiftTemplates}
            onDataSync={(type, data) => setConfigData(prev => ({ ...prev, [type]: data }))}
          />
        </div>

        {/* ส่วนตารางจัดเวร */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                จัดตารางเวรพยาบาล — {monthName}
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
            scheduleRows={scheduleRows} 
            pendingAssignments={pendingAssignments}
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) modal.open(nurseId, day)
            }}
          />
        </div>
      </div>

      <NurseSummaryPanel scheduleRows={scheduleRows} />

      {/* Modal จัดการเวรรายคน - เชื่อมต่อ Props จาก Hook modal ทั้งหมด */}
      <SelectShiftModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        nurseName={modal.nurseName}
        dateLabel={`วันที่ ${modal.day + 1} ${monthName}`}
        currentAssignments={modal.currentAssignments}

        shiftTemplates={shiftTemplates}
        
        // Selection State/Actions จาก Hook
        selectedTypes={modal.selectedTypes}
        onSelectType={modal.handleSelectType}
        onClearSelection={() => modal.setSelectedTypes([])}
        
        // Delete Logic จาก Hook
        deleteTarget={modal.deleteTarget}
        setDeleteTarget={modal.setDeleteTarget}
        isDeleting={modal.isDeleting}
        onExecuteDelete={modal.executeDelete}
       
        // 🚩 เพิ่ม Prop นี้เข้าไปเพื่อให้ Modal แสดงรายการที่ "กำลังรอเซฟ" ได้
        pendingAssignments={pendingAssignments}
        
        // เมื่อกด Confirm การเพิ่มเวรใหม่
       // 🚩 ปรับโครงสร้างข้อมูลที่จะเก็บใน PendingAssignments
        onConfirm={(selectedTypes) => {
      const newItems = selectedTypes.map(type => {
      // 1. เช็คว่าเป็นเวรปกติหรือไม่
      const isNormalShift = ['morning', 'afternoon', 'night'].includes(type);
      
      // 2. หา Template เพื่อดึง ID (สำคัญมากตามรูป Postman)
      const template = shiftTemplates.find(t => t.type === type);
        
        // 🚩 คำนวณวันที่จริง (1-31)
      const actualDay = modal.day + 1;

      // 3. สร้าง Object ให้โครงสร้างเหมือน Body ใน Postman
      return {
        userId: modal.userId,
        day: actualDay,
        nurseName: modal.nurseName, // เก็บไว้ดูใน Console/UI
        // สร้าง Format วันที่ "YYYY-MM-DD"
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`,
        
        // ส่งเป็นตัวเล็กตาม Postman: "shift", "leave", "off", "emergency"
        assignmentType: isNormalShift ? 'shift' : type.toLowerCase(),
        
        // ถ้าเป็นเวรปกติ ให้ใส่ shiftTemplateId เข้าไปด้วย
        ...(isNormalShift && { shiftTemplateId: template?.shiftTemplateId }),
        
        // เก็บไว้ debug ใน frontend
        templateType: isNormalShift ? type : null 
        };
      });

      // Console ดูข้อมูลที่กำลังจะเพิ่มเข้า Queue (ยังไม่ยิง API)
      console.log("📍 Added to Pending:", newItems);

      setPendingAssignments(prev => [...prev, ...newItems]);
      modal.close();
        }}
      />

      {validationErrors.length > 0 && !isSidebarOpen && (
        <FloatingErrorBtn 
          count={validationErrors.length} 
          onClick={() => setIsSidebarOpen(true)} 
        />
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-400 text-sm">กำลังโหลดข้อมูลวอร์ด...</p>
      </div>
    </div>
  )
}