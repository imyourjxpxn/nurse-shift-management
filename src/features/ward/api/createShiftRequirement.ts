import { apiFetch } from '@/lib/api-client'


export async function createShiftRequirement(shiftTemplateId: string, requiredPeople: number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🚩 ตรวจสอบ URL ให้ตรงกับ Params ที่ Backend กำหนด (/:shiftTemplateId)
  const url = `${baseUrl}/api/shift-requirement/create/${shiftTemplateId}`;

  const response = await apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requiredPeople: Math.floor(Number(requiredPeople)) 
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ไม่สามารถกำหนดจำนวนพยาบาลได้");
  }

  return await response.json();
}