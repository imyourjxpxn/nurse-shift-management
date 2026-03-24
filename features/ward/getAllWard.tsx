import { apiFetch } from '@/lib/api-client'
import { Ward } from './types'

// ✅ ไม่ต้องรับ hospitalId แล้ว เพราะ Backend จะหาจาก User ID ใน Token เอง
export async function getAllWards(): Promise<Ward[]> {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ward/getAllWardInHospital`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch wards')
  }

  const data = await res.json()

  // ป้องกันกรณี data เป็น null หรือไม่ใช่ array
  if (!Array.isArray(data)) return [];

  return data.map((w: any) => ({
    wardId: w.wardId,
    wardName: w.wardName,
    member: Number(w.member || 0),
    createdBy: w.createdBy,
  }))
}