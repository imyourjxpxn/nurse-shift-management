import { useState, useEffect } from 'react'
import { getWardById } from '@/features/ward/api/getWardById' 
import { getShiftTemplates } from '@/features/ward/api/getAllShiftTemplates'
import { getShiftAssignmentsSummary } from '@/features/ward/api/getShiftAssignments'
import { 
  WardDetail, 
  ShiftTemplate, 
  NurseSummary, 
  UserShiftAssignment, 
  NurseScheduleRow,
  AssignmentType 
} from '@/features/ward/types'

export function useScheduleData(wardId: string, daysInMonth: number, month: number, year: number) {
  const [wardData, setWardData] = useState<WardDetail | null>(null)
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // เก็บข้อมูลตารางเวรโดยใช้ userId เป็น Key
  const [scheduleRows, setScheduleRows] = useState<Record<string, NurseScheduleRow>>({})

  const fetchData = async () => {
    if (!wardId) return
    try {
      setLoadingData(true)
      setError(null)
      
      const [ward, templates, assignmentsData] = await Promise.all([
        getWardById(wardId),
        getShiftTemplates(wardId, year, month),
        getShiftAssignmentsSummary(wardId, year, month)
      ])

      // 🚩 Log ข้อมูลห้ามลบ (สำคัญมากสำหรับการ Debug)
      console.log("📦 Ward Data:", ward);
      console.log("📦 Assignments Data:", assignmentsData);
      
      setWardData(ward)
      setShiftTemplates(templates || [])

      const tempRows: Record<string, NurseScheduleRow> = {};

      // 🚩 ดึงรายชื่อพยาบาลและข้อมูลเวรจาก assignmentsData
      const assignments: UserShiftAssignment[] = Array.isArray(assignmentsData) 
        ? assignmentsData 
        : (assignmentsData as any)?.data || [];

      assignments.forEach((userRecord) => {
        // ✨ Log ข้อมูลรายคนห้ามลบ
        console.log(`👤 User: ${userRecord.name} (ID: ${userRecord.userId})`, userRecord.assignments);

        const isHead = userRecord.userRole === 'head_nurse';
        
        // 1. สร้างโครงสร้างแถว (NurseScheduleRow) ตาม Types ใหม่
        tempRows[userRecord.userId] = {
          displayName: isHead ? `${userRecord.name} (Head)` : userRecord.name,
          dailyShifts: Array.from({ length: daysInMonth }, () => ["", "", ""]),
          summary: { 
            morning: 0, 
            afternoon: 0, 
            night: 0, 
            emergency: 0, 
            off: 0, 
            leave: 0, 
            totalShifts: 0 
          }
        };

        // 2. เติมข้อมูลเวรลงใน dailyShifts และคำนวณ summary
        if (userRecord.assignments && userRecord.assignments.length > 0) {
          userRecord.assignments.forEach((asn) => {
            const dateParts = asn.date.split('-');
            // ดึงวันที่จาก "YYYY-MM-DD" มาลบ 1 เพื่อให้ได้ Index (0-30)
            const dayIndex = parseInt(dateParts[2], 10) - 1;

            if (dayIndex >= 0 && dayIndex < daysInMonth) {
              const type = asn.assignmentType;
              const row = tempRows[userRecord.userId];
              const summary = row.summary;

              if (type === AssignmentType.SHIFT) {
                const sType = asn.shiftTemplateType;
                summary.totalShifts++;
                if (sType === 'morning') { row.dailyShifts[dayIndex][0] = "ช"; summary.morning++; }
                else if (sType === 'afternoon') { row.dailyShifts[dayIndex][1] = "บ"; summary.afternoon++; }
                else if (sType === 'night') { row.dailyShifts[dayIndex][2] = "ด"; summary.night++; }
              } else if (type !== AssignmentType.NONE) {
                // จัดการสถานะพิเศษ (OFF, LEAVE, EMERGENCY)
                const specialMap: Record<string, string> = { 
                  [AssignmentType.OFF]: 'o', 
                  [AssignmentType.LEAVE]: 'ล', 
                  [AssignmentType.EMERGENCY]: 'E' 
                };
                
                if (type === AssignmentType.OFF) summary.off++;
                if (type === AssignmentType.LEAVE) summary.leave++;
                if (type === AssignmentType.EMERGENCY) { 
                  summary.emergency++; 
                  summary.totalShifts++; 
                }
                
                // แทนที่ทั้งช่องด้วยตัวย่อสถานะพิเศษ
                row.dailyShifts[dayIndex] = [specialMap[type] || type.toUpperCase()];
              }
            }
          });
        }
      });

      setScheduleRows(tempRows);

    } catch (err: any) {
      console.error("Fetch Schedule Error:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [wardId, daysInMonth, month, year])

  return { 
    wardData, 
    shiftTemplates,
    scheduleRows,
    loadingData, 
    error, 
    refresh: fetchData 
  }
}