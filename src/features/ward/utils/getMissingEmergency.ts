import { NurseScheduleRow } from '@/features/ward/types';

export const getMissingEmergencyDays = (
  scheduleRows: Record<string, NurseScheduleRow>,
  pendingAssignments: any[],
  daysInMonth: number
) => {
  const dailyCounts = Array(daysInMonth).fill(0);

  // 1. นับจากข้อมูลที่มีอยู่แล้วในตาราง (Existing)
  Object.values(scheduleRows).forEach((row) => {
    row.dailyShifts?.forEach((dayShifts, index) => {
      if (index >= daysInMonth) return;
      const hasEmergency = dayShifts.some(shift => 
        shift?.code === 'E' || 
        shift?.assignmentType?.toLowerCase() === 'emergency'
      );
      if (hasEmergency) dailyCounts[index] += 1;
    });
  });

  // 2. นับจากข้อมูลที่กำลังจะบันทึก (Pending)
  pendingAssignments.forEach((p) => {
    const type = p.assignmentType?.toLowerCase() || p.templateType?.toLowerCase();
    if (type === 'emergency') {
      const dayPart = p.date.split('-')[2]; 
      const index = parseInt(dayPart, 10) - 1;
      if (index >= 0 && index < daysInMonth) {
        dailyCounts[index] += 1;
      }
    }
  });

  const missingDays: number[] = [];
  dailyCounts.forEach((count, index) => {
    if (count === 0) missingDays.push(index + 1);
  });

  return missingDays;
};