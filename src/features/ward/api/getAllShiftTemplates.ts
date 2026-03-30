import { apiFetch } from '@/lib/api-client'
import { ShiftTemplate } from '../types'

export async function getShiftTemplates(
  wardId: string, 
  year: number, 
  month: number
): Promise<ShiftTemplate[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 🚩 แปลง month จาก 0-11 (JS) เป็น 1-12 (API Schema)
  const apiMonth = month + 1;

  // 🚩 สร้าง Query String: ?year=2026&month=3
  const params = new URLSearchParams({
    year: year.toString(),
    month: apiMonth.toString()
  });

  const url = `${baseUrl}/api/shift-template/getAllShiftTemplateInWard/${wardId}?${params.toString()}`;
  console.log("🔗 ยิงไปที่ URL นี้:", url);
  
  const response = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    // ถ้าไม่พบข้อมูล (404) ให้ส่ง Array ว่างกลับไปเพื่อให้ UI ไม่พัง
    if (response.status === 404) return [];
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลเวรได้');
  }

  // คืนค่ารายการ Shift Template (ซึ่งรวม requiredPeople มาให้แล้วตาม Schema)
  return response.json();
}