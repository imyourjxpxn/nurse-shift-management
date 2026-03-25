
import { apiFetch } from '@/lib/api-client'
import { Ward } from '../types'

export interface CreateWardResponse extends Ward {
  joinCode: string; // เราต้องการรหัสนี้ไปโชว์ใน Pop-up
}

export async function createWard(wardName: string): Promise<CreateWardResponse> {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ward/create`, {
    method: 'POST',
    body: JSON.stringify({ wardName }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'สร้างวอร์ดไม่สำเร็จ')
  }

  return res.json()
}