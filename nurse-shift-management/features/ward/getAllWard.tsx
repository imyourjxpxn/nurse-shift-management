// features/ward/ward.service.ts

import { apiFetch } from "@/lib/api-client"

export interface Ward {
  wardId: string
  wardName: string
  member: number
  createdBy: string
}

export async function getAllWards(): Promise<Ward[]> {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ward/getAllWardInHospital`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch wards")
  }

  const data = await res.json()

  // 🔥 เผื่อ backend ส่ง member เป็น string
  return data.map((w: any) => ({
    wardId: w.wardId,
    wardName: w.wardName,
    member: Number(w.member),
    createdBy: w.createdBy,
  }))
}