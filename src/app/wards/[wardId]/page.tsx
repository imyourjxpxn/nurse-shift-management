'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context' 

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
  LegendItem,
  FloatingErrorBtn 
} from '@/features/ward/components/ScheduleUIExtras'

// Hooks
import { useCalendar } from '@/features/ward/hooks/useCalendar'
import { useShiftValidation } from '@/features/ward/utils/useShiftTempValidation'
import { useScheduleData } from '@/features/ward/hooks/useScheduleData'
import { useSaveConfig } from '@/features/ward/hooks/useSaveConfig'
import { useScheduleModal } from '@/features/ward/hooks/useScheduleModal'

// 🚩 Modal สลับเวร (ตัวที่เราเพิ่งทำกัน)
import ShiftSwapModal from '@/features/ward/components/ShiftSwapModal'

export default function SchedulePage() {
  const { user } = useAuth()
  const currentUserId = user?.userId || ''
  const { wardId } = useParams() as { wardId: string }
  
  const { month, year, monthName, daysInMonth, setMonth, setYear } = useCalendar()
  const { wardData, shiftTemplates, loadingData, scheduleRows, refresh } = useScheduleData(wardId, daysInMonth, month, year)

  const [configData, setConfigData] = useState<Record<string, any>>({})
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([])

  // 🚩 State สำหรับระบบแลกเวร (Nurse Only)
  const [swapData, setSwapData] = useState<any>(null)
  const [showSwapSuccess, setShowSwapSuccess] = useState(false) // สำหรับแจ้งเตือนเมื่อแลกสำเร็จ

  const modal = useScheduleModal(scheduleRows, refresh, pendingAssignments)
  const { isValid, messages } = useShiftValidation(configData)

  const { 
    isSaving, showSuccessToast, validationErrors, isSidebarOpen, setIsSidebarOpen, handleSave
  } = useSaveConfig({
    wardId, year, month, isFormValid: isValid, validationMsg: messages,
    daysInMonth, scheduleRows: scheduleRows, shiftTemplates: shiftTemplates
  })

  if (loadingData && Object.keys(scheduleRows).length === 0) return <LoadingSpinner />

  const isHeadNurse = wardData?.userRole === 'head_nurse'

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative overflow-x-hidden text-slate-900 font-sans">
      <BackButton />
      
      {/* --- Toast Notifications --- */}
      {isSaving && <ToastSaving />}
      {showSuccessToast && <ToastSuccess />}
      
      {/* 🚩 แสดง Toast สีเขียวเมื่อพยาบาลส่งคำขอแลกเวรสำเร็จ */}
      {showSwapSuccess && <ToastSuccess />}

      <ValidationErrorSidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} errors={validationErrors} 
      />

      {wardData && (
        <WardDetail 
          ward={wardData} month={monthName} year={year.toString()}
          onMonthChange={setMonth} onYearChange={setYear}
          currentMonthIdx={month} currentYear={year}
          onSave={() => handleSave(configData, pendingAssignments, () => {
            setPendingAssignments([]); refresh();
          })} 
        />
      )}

      <div className="space-y-6">
        <ShiftConfigPanel 
          isEditable={isHeadNurse} templates={shiftTemplates}
          onDataSync={(type, data) => setConfigData(prev => ({ ...prev, [type]: data }))}
        />

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                จัดตารางเวรพยาบาล — เดือน{monthName}
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
              <LegendItem color="bg-sky-100" label="เวรเช้า : ช" />
              <LegendItem color="bg-orange-100" label="เวรบ่าย : บ" />
              <LegendItem color="bg-violet-100" label="เวรดึก : ด" />
              <LegendItem color="bg-rose-100" label="Emergency : E" />
              <LegendItem color="bg-green-100" label="off : o" />
              <LegendItem color="bg-slate-100" label="ลา : ล" />
            </div>
          </div>

          <ScheduleTable
            daysInMonth={daysInMonth}
            scheduleRows={scheduleRows} 
            pendingAssignments={pendingAssignments}
            isDisabled={!isValid || isSaving}
            userRole={isHeadNurse ? 'head_nurse' : 'nurse'}
            currentUserId={currentUserId}
            onCellClick={(nurseId, day, cellData) => {
              if (isHeadNurse) {
                // ถ้าเป็น Head Nurse ให้เปิด Modal แก้ไขตารางปกติ
                modal.open(nurseId, day)
              } else if (nurseId === currentUserId && cellData?.shiftAssignmentId) {
                // 🚩 เปลี่ยนจาก cellData.type เป็น templateType หรือ assignmentType
                  setSwapData({
                    assignmentId: cellData.shiftAssignmentId,
                    shiftName: cellData.code,
                    // ใช้ templateType (เช้า/บ่าย/ดึก) หรือถ้าไม่มีให้ใช้ assignmentType (shift/off/leave)
                    type: cellData.templateType || cellData.assignmentType, 
                    date: new Date(year, month, day + 1).toISOString(),
                    dateLabel: `วันที่ ${day + 1} ${monthName}`
                  })
              }
            }}
          />
        </div>
      </div>

      <NurseSummaryPanel scheduleRows={scheduleRows} />

      {/* --- Modal เลือกเวร (สำหรับ Head Nurse เท่านั้น) --- */}
      <SelectShiftModal
        isOpen={modal.isOpen} onClose={modal.close}
        nurseName={modal.nurseName} dateLabel={`วันที่ ${modal.day + 1} ${monthName}`}
        userId={modal.userId} day={modal.day}
        currentAssignments={modal.currentAssignments}
        shiftTemplates={shiftTemplates}
        selectedTypes={modal.selectedTypes} onSelectType={modal.handleSelectType}
        deleteTarget={modal.deleteTarget} setDeleteTarget={modal.setDeleteTarget}
        isDeleting={modal.isDeleting} onExecuteDelete={modal.executeDelete}
        onConfirm={(selectedTypes) => {
          const actualDay = modal.day + 1;
          setPendingAssignments(prev => {
            const filtered = prev.filter(p => !(p.userId === modal.userId && p.day === actualDay));
            const newItems = selectedTypes.map(type => ({
              userId: modal.userId, day: actualDay, nurseName: modal.nurseName,
              date: `${year}-${String(month + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`,
              assignmentType: ['morning', 'afternoon', 'night'].includes(type) ? 'shift' : type.toLowerCase(),
              shiftTemplateId: shiftTemplates.find(t => t.type === type)?.shiftTemplateId || null,
              templateType: type 
            }));
            return [...filtered, ...newItems];
          });
          modal.close();
        }}
      />

      {/* 🚩 Modal แลกเวร (สำหรับ Nurse - เรียกใช้ไฟล์เดียวจบ) */}
      {swapData && (
        <ShiftSwapModal 
          isOpen={!!swapData}
          onClose={() => setSwapData(null)}
          wardId={wardId}
          requesterShift={swapData}
          currentYear={year}
          currentMonth={month + 1} 
          onConfirm={() => {
            // เมื่อส่งคำขอสำเร็จ:
            setShowSwapSuccess(true); // 1. โชว์ Toast
            setTimeout(() => setShowSwapSuccess(false), 3000); // 2. ปิด Toast หลัง 3 วิ
            setSwapData(null); // 3. ปิด Modal
            refresh(); // 4. อัปเดตข้อมูลตารางใหม่
          }}
        />
      )}

      {validationErrors.length > 0 && !isSidebarOpen && (
        <FloatingErrorBtn count={validationErrors.length} onClick={() => setIsSidebarOpen(true)} />
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-500 text-sm">กำลังโหลดข้อมูลวอร์ด...</p>
      </div>
    </div>
  )
}