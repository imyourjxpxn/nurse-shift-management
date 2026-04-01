// features/ward/api/getShiftAssignments.ts
import { apiFetch } from '@/lib/api-client'

export async function getShiftAssignmentsSummary(
  wardId: string,
  year: number,
  month: number
) {
  const apiMonth = month + 1; // ปรับให้ตรงกับ 1-12 ของ Backend
  const params = new URLSearchParams({
    year: year.toString(),
    month: apiMonth.toString()
  });

  const url = `/api/shift-assignment/getSummary/${wardId}?${params.toString()}`;
  
  const response = await apiFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('โหลดข้อมูลตารางเวรไม่สำเร็จ');
  
  return response.json(); 
}