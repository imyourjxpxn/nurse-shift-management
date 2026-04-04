import { apiFetch } from '@/lib/api-client';

export async function deleteShiftAssignment(assignmentId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // ตรวจสอบ Path ให้ตรงกับ Backend (ในที่นี้ใช้ตามที่คุณส่งมา)
  const url = `${baseUrl}/api/shift-assignment/delete/${assignmentId}`;

  const response = await apiFetch(url, {
    method: 'PATCH', // 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}) // ส่ง body ว่างเพื่อแก้ปัญหา error ก่อนหน้านี้
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ไม่สามารถลบข้อมูลเวรได้");
  }

  // ป้องกันกรณี API คืนค่า 204 No Content
  return await response.json().catch(() => ({ success: true }));
}