import { apiFetch } from '@/lib/api-client'; // 🚩 นำเข้า apiFetch มาใช้

export async function createShiftTemplate(payload: any[]) {
  // 🚩 ปรับ Body ให้เป็น lowercase ตามที่ Backend ต้องการ
  const body = payload.map(item => ({
    wardId: item.wardId,
    type: item.type.toLowerCase(), 
    startTime: item.startTime,
    endTime: item.endTime,
    requiredPeople: Number(item.requiredPeople) || 0
  }));

  // 🚩 เปลี่ยนมาใช้ apiFetch (ไม่ต้องใส่ Bearer เอง ไม่ต้องใส่ Base URL เอง)
  const response = await apiFetch('/api/shift-template/create', {
    method: 'POST',
    body: JSON.stringify(body) 
  });
  
  return await response.json(); 
}