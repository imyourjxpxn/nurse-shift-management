// services/hospital.service.ts
import { apiFetch } from "@/lib/api-client"

export interface Hospital {
  hospitalId: string
  name: string
}

export async function getHospitals(): Promise<Hospital[]> {

  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hospital/getAllHospital`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch hospitals')
  }

  return res.json()
}