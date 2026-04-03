import { apiFetch } from '@/lib/api-client';

export async function deleteShiftAssignment(assignmentId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // ยิงไปที่ /api/shift-assignment/:assignmentId
  const url = `${baseUrl}/api/shift-assignment/delete/${assignmentId}`;

  const response = await apiFetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ไม่สามารถลบข้อมูลเวรได้");
  }

  // ป้องกันกรณี API คืนค่าว่าง (204 No Content)
  return await response.json().catch(() => ({ success: true }));
}