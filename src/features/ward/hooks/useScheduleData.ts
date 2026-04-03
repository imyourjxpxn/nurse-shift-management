import { useState, useEffect } from 'react';
import { getWardById } from '@/features/ward/api/getWardById'; 
import { getShiftTemplates } from '@/features/ward/api/getAllShiftTemplates';
import { getShiftAssignmentsSummary } from '@/features/ward/api/getShiftAssignments';
import { 
  WardDetail, 
  ShiftTemplate, 
  UserShiftAssignment, 
  NurseScheduleRow,
  AssignmentType,
  ShiftCellData
} from '@/features/ward/types';

/**
 * Hook สำหรับจัดการข้อมูลตารางเวรทั้งหมดในเดือน
 * @param wardId - ID ของวอร์ด
 * @param daysInMonth - จำนวนวันในเดือนนั้น (เช่น 30, 31)
 * @param month - เดือนที่เลือก (1-12)
 * @param year - ปีที่เลือก (ค.ศ.)
 */
export function useScheduleData(wardId: string, daysInMonth: number, month: number, year: number) {
  const [wardData, setWardData] = useState<WardDetail | null>(null);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleRows, setScheduleRows] = useState<Record<string, NurseScheduleRow>>({});

  const fetchData = async () => {
    if (!wardId) return;
    try {
      setLoadingData(true);
      setError(null);
      
      const [ward, templates, assignmentsData] = await Promise.all([
        getWardById(wardId),
        getShiftTemplates(wardId, year, month),
        getShiftAssignmentsSummary(wardId, year, month)
      ]);

      console.log("📦 Fetching Data for:", { year, month, wardId });
      
      setWardData(ward);
      setShiftTemplates(templates || []);

      const tempRows: Record<string, NurseScheduleRow> = {};

      const assignments: UserShiftAssignment[] = Array.isArray(assignmentsData) 
        ? assignmentsData 
        : (assignmentsData as any)?.data || [];

      assignments.forEach((userRecord) => {
        const isHead = (userRecord as any).userRole === 'head_nurse';
        
        tempRows[userRecord.userId] = {
          displayName: isHead ? `${userRecord.name} (Head)` : userRecord.name,
          dailyShifts: Array.from({ length: daysInMonth }, () => [null, null, null]),
          summary: { 
            morning: 0, afternoon: 0, night: 0, 
            emergency: 0, off: 0, leave: 0, totalShifts: 0 
          }
        };

        if (userRecord.assignments && userRecord.assignments.length > 0) {
          userRecord.assignments.forEach((asn) => {
            const d = new Date(asn.date);
            const dayIndex = d.getDate() - 1;

            if (dayIndex >= 0 && dayIndex < daysInMonth) {
              const row = tempRows[userRecord.userId];
              const summary = row.summary;
              const type = asn.assignmentType;

              // 1. สร้าง Object กลางที่ยังไม่มี 'code' (เพื่อเลี่ยง Error ตอนประกาศ Type)
              const assignmentInfo = {
                shiftAssignmentId: asn.shiftAssignmentId,
                assignmentType: type,
                templateType: asn.shiftTemplateType || undefined,
                shiftTemplateId: (asn as any).shiftTemplateId || null, 
              };

              // กรณีเป็นเวรปกติ (SHIFT)
              if (type === AssignmentType.SHIFT) {
                const sType = asn.shiftTemplateType;
                summary.totalShifts++;

                // 2. รวมร่างข้อมูลเข้ากับ 'code' และระบุ Type เป็น ShiftCellData
                if (sType === 'morning') { 
                  row.dailyShifts[dayIndex][0] = { ...assignmentInfo, code: "ช" } as ShiftCellData; 
                  summary.morning++; 
                }
                else if (sType === 'afternoon') { 
                  row.dailyShifts[dayIndex][1] = { ...assignmentInfo, code: "บ" } as ShiftCellData; 
                  summary.afternoon++; 
                }
                else if (sType === 'night') { 
                  row.dailyShifts[dayIndex][2] = { ...assignmentInfo, code: "ด" } as ShiftCellData; 
                  summary.night++; 
                }
              } 
              // กรณีเป็นสถานะพิเศษ (OFF, LEAVE, EMERGENCY)
              else if (type !== AssignmentType.NONE) {
                const specialMap: Record<string, string> = { 
                  [AssignmentType.OFF]: 'o', 
                  [AssignmentType.LEAVE]: 'ล', 
                  [AssignmentType.EMERGENCY]: 'E' 
                };
                
                const code = specialMap[type] || type.toUpperCase();

                if (type === AssignmentType.OFF) summary.off++;
                if (type === AssignmentType.LEAVE) summary.leave++;
                if (type === AssignmentType.EMERGENCY) { 
                  summary.off++; 
                  summary.emergency++; 
                  summary.totalShifts++; 
                }
                
                // สำหรับค่าพิเศษ ล้างช่องอื่นแล้วใส่ข้อมูลพร้อม 'code'
                row.dailyShifts[dayIndex] = [
                  { ...assignmentInfo, code } as ShiftCellData,
                  null,
                  null
                ];
              }
            }
          });
        }
      });

      setScheduleRows(tempRows);
    } catch (err: any) {
      console.error("❌ Fetch Schedule Error:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [wardId, daysInMonth, month, year]);

  return { 
    wardData, 
    shiftTemplates,
    scheduleRows,
    loadingData, 
    error, 
    refresh: fetchData 
  };
}