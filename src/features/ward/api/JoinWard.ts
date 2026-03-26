import { apiFetch } from '@/lib/api-client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function joinWard(wardId: string, joinCode: string) {
  try {
    const res = await apiFetch(
      `${BASE_URL}/api/ward-member/create/${wardId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          wardId,
          joinCode,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      // ถ้า Backend ส่ง error message มา เราจะใช้ตัวนั้น 
      // แต่ถ้าไม่มี หรือเป็น 400 ทั่วไป เราจะโยน Error ไปดักข้างนอก
      throw new Error(data?.message || 'INVALID_CODE')
    }

    return data
  } catch (error: any) {
    // ส่ง Error ต่อไปให้ Component จัดการ
    throw error
  }
}