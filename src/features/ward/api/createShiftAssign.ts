import { apiFetch } from '@/lib/api-client';

export async function createShiftAssignment(
  wardId: string,
  year: number,
  month: number,
  data: any[] // Body เป็น Array ของวัตถุเวร
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiMonth = month + 1; // ปรับให้ตรงกับ Logic เดือนของ API

  // จัดการ Query Parameters
  const params = new URLSearchParams({
    year: year.toString(),
    month: apiMonth.toString()
  });

  const url = `${baseUrl}/api/shift-assignment/create/${wardId}?${params.toString()}`;

  // 🚩 apiFetch จัดการ throw error ให้แล้ว 
  // ดังนั้นถ้ามันรันมาถึงบรรทัดล่างนี้ แปลว่า res.ok แน่นอน
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });

  // ใช้ .json() ได้เลย เพราะ apiFetch คืนค่า res (Response Object) มาให้
  return await response.json();
}