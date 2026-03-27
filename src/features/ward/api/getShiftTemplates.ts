import { ShiftTemplate } from '../types'

export async function getShiftTemplates(wardId: string): Promise<ShiftTemplate[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shift-template/getAllShiftTemplateInWard/${wardId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    // ถ้ายังไม่มีข้อมูลใน DB ให้ส่ง Array ว่างกลับไปก่อนเพื่อให้กรอกใหม่ได้
    if (response.status === 404) return []
    throw new Error('ไม่สามารถดึงข้อมูลเวรได้')
  }

  return response.json()
}