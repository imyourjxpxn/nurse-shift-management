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

  const response = await apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ไม่สามารถสร้างข้อมูลเวรได้");
  }

  return await response.json();
}