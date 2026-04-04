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
  LegendItem,
  FloatingErrorBtn // 🚩 Import เพิ่มตรงนี้ครับ
} from '@/features/ward/components/ScheduleUIExtras'

// Hooks
import { useCalendar } from '@/features/ward/hooks/useCalendar'
import { useShiftValidation } from '@/features/ward/utils/useShiftTempValidation'
import { useScheduleData } from '@/features/ward/hooks/useScheduleData'
import { useSaveConfig } from '@/features/ward/hooks/useSaveConfig'
import { useScheduleModal } from '@/features/ward/hooks/useScheduleModal'

export default function SchedulePage() {
  const { wardId } = useParams() as { wardId: string }
  
  // 1. จัดการวันที่และปฏิทิน
  const { 
    month, year, monthName, daysInMonth, setMonth, setYear 
  } = useCalendar()

  // 2. ดึงข้อมูลวอร์ดและตารางจาก API
  const { 
    wardData, shiftTemplates, loadingData, scheduleRows, refresh 
  } = useScheduleData(wardId, daysInMonth, month, year)

  // 3. Local State สำหรับการแก้ไข
  const [configData, setConfigData] = useState<Record<string, any>>({})
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([])

  // 4. Hook จัดการ Modal (เปิด/ปิด/เลือกเวร/ลบเวร)
  const modal = useScheduleModal(scheduleRows, refresh, pendingAssignments)

  // 5. Hook สำหรับการ Validation
  const { isValid, messages } = useShiftValidation(configData)

  // 6. Hook สำหรับการ Save
  const { 
    isSaving, 
    showSuccessToast, 
    validationErrors, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    handleSave
  } = useSaveConfig({
    wardId, 
    year, 
    month,
    isFormValid: isValid, 
    validationMsg: messages,
    daysInMonth,
    scheduleRows: scheduleRows
  })

  // แสดง Loading ถ้ายังไม่มีข้อมูล
  if (loadingData && Object.keys(scheduleRows).length === 0) {
    return <LoadingSpinner />
  }

  const isHeadNurse = wardData?.userRole === 'head_nurse'

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative overflow-x-hidden text-slate-900 font-sans">
      <BackButton />
      
      {/* --- Feedback UI --- */}
      {isSaving && <ToastSaving />}
      {showSuccessToast && <ToastSuccess />}

      {/* --- Sidebar แสดงแจ้งเตือน --- */}
      <ValidationErrorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        errors={validationErrors} 
      />

      {/* --- Ward Header & Save Button --- */}
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
            setPendingAssignments([]); 
            refresh(); 
          })} 
        />
      )}

      <div className="space-y-6">
        <ShiftConfigPanel 
          isEditable={isHeadNurse}
          templates={shiftTemplates}
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
              <LegendItem color="bg-slate-100" label="ล : ลา" />
              <LegendItem color="bg-green-100" label="o : off" />
            </div>
          </div>

          <ScheduleTable
            daysInMonth={daysInMonth}
            scheduleRows={scheduleRows} 
            pendingAssignments={pendingAssignments}
            isDisabled={!isValid}
            onCellClick={(nurseId, day) => {
              if (isHeadNurse) modal.open(nurseId, day)
            }}
          />
        </div>
      </div>

      <NurseSummaryPanel scheduleRows={scheduleRows} />

      {/* --- Modal เลือกเวร --- */}
      <SelectShiftModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        nurseName={modal.nurseName}
        dateLabel={`วันที่ ${modal.day + 1} ${monthName}`}
        userId={modal.userId}
        day={modal.day}
        currentAssignments={modal.currentAssignments}
        shiftTemplates={shiftTemplates}
        selectedTypes={modal.selectedTypes}
        onSelectType={modal.handleSelectType}
        deleteTarget={modal.deleteTarget}
        setDeleteTarget={modal.setDeleteTarget}
        isDeleting={modal.isDeleting}
        onExecuteDelete={modal.executeDelete}
        onConfirm={(selectedTypes) => {
          const actualDay = modal.day + 1;
          setPendingAssignments(prev => {
            const filtered = prev.filter(p => !(p.userId === modal.userId && p.day === actualDay));
            if (selectedTypes.length > 0) {
              const newItems = selectedTypes.map(type => {
                const isNormalShift = ['morning', 'afternoon', 'night'].includes(type);
                const template = shiftTemplates.find(t => t.type === type);
                return {
                  userId: modal.userId,
                  day: actualDay,
                  nurseName: modal.nurseName,
                  date: `${year}-${String(month + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`,
                  assignmentType: isNormalShift ? 'shift' : type.toLowerCase(),
                  ...(isNormalShift && { shiftTemplateId: template?.shiftTemplateId }),
                  templateType: type 
                };
              });
              return [...filtered, ...newItems];
            }
            return filtered;
          });
          modal.close();
        }}
      />

      {/* 🚩 ปุ่มลอยสำหรับเปิด Sidebar (แสดงเมื่อมี error และ sidebar ถูกปิดอยู่) */}
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-500 text-sm">กำลังโหลดข้อมูลวอร์ด...</p>
      </div>
    </div>
  )
}