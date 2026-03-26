import { apiFetch } from '@/lib/api-client'
import { WardDetail } from '../types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getWardById(wardId: string): Promise<WardDetail> {
  const url = `${BASE_URL}/api/ward/getWardById/${wardId}`;
  console.log("🚀 Requesting URL:", url); // <--- ดูที่ Console ใน Browser ว่ามันโชว์ /get/ ไหม

  const res = await apiFetch(url, {
    method: 'GET',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'ไม่สามารถดึงข้อมูลวอร์ดได้')
  }

  return res.json()
}