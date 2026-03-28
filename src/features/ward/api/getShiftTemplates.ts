import { apiFetch } from '@/lib/api-client' // นำเข้าตัวเดียวกับที่ getWardById ใช้
import { ShiftTemplate } from '../types'

export async function getShiftTemplates(wardId: string): Promise<ShiftTemplate[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/shift-template/getAllShiftTemplateInWard/${wardId}`;
  
  // ใช้ apiFetch แทน fetch ปกติ
  const response = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    // ถ้ายังไม่มีข้อมูลใน DB (404) ให้ส่ง Array ว่าง
    if (response.status === 404) return []
    
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลเวรได้')
  }

  return response.json()
}