import { apiFetch } from '@/lib/api-client'

// 1. เปลี่ยนชื่อ Interface ให้ไม่ซ้ำกับชื่อฟังก์ชัน
export interface ShiftAssignmentSwapResponse {
  approverShiftAssignmentId: string;
  approverName: string;
  shiftAssignmentType: string;
  shiftTemplateType: string | null;
}

// 2. เพิ่ม Interface สำหรับ Parameters (ตามที่เราคุยเรื่อง day กันตะกี้)
export interface GetShiftForSwapParams {
  year: number;
  month: number;
  day?: number; // ตัวนี้แหละที่จะทำให้หาย Error เรื่อง unknown property
  approverUserId: string;
}

// 3. ปรับฟังก์ชันให้ใช้ Interface ใหม่
export async function getShiftAssignmentsForSwap(
  wardId: string,
  params: GetShiftForSwapParams
): Promise<ShiftAssignmentSwapResponse[]> { // 🚩 ใช้ชื่อที่เปลี่ยนใหม่ตรงนี้
  
  const query = new URLSearchParams({
    year: params.year.toString(),
    month: params.month.toString(),
    approverUserId: params.approverUserId
  });

  if (params.day) {
    query.append('day', params.day.toString());
  }

  const url = `/api/shift-assignment/getForSwap/${wardId}?${query.toString()}`;
  
  const response = await apiFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('โหลดข้อมูลเวรของเพื่อนไม่สำเร็จ');
  
  return response.json();
}