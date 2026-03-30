import { apiFetch } from '@/lib/api-client'

/**
 * สร้าง Shift Template แบบเป็นชุด (Array) ตาม Schema ใหม่
 * @param payload - Array ของ Shift Template ที่ต้องการสร้าง/อัปเดต
 */
export async function createShiftTemplate(payload: any[]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;


  const body = payload.map(item => ({
    wardId: item.wardId,
    type: item.type,
    startTime: item.startTime,
    endTime: item.endTime,
    requiredPeople: Number(item.requiredPeople) 
  }));

  const response = await apiFetch(`${baseUrl}/api/shift-template/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body) 
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลเวรได้");
  }

  // คืนค่า Response ที่มีทั้ง shiftTemplate และ shiftRequirement
  return await response.json(); 
}