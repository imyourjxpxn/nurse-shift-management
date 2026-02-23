import { apiFetch } from "@/lib/api-client"

export interface UserHospital {
  hospitalId: string
  name: string
}

export async function getUserHospital(): Promise<UserHospital> {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hospital/getUserHospital`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch hospital')
  }

  const data = await res.json()
  return data
}