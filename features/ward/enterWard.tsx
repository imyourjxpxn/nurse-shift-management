import { apiFetch } from '@/lib/api-client'
import { EnterWardResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * ใช้ตอนกด Enter Ward
 * - ถ้าเป็นสมาชิก → return ward detail
 */


export async function enterWard(
  wardId: string
): Promise<EnterWardResponse> {

  console.log("===== ENTER WARD (FRONTEND) =====")
  console.log("wardId:", wardId)

  const res = await apiFetch(
    `/api/ward/enterWard/${wardId}`,
    {
      method: 'GET',
    }
  )

  console.log("status:", res.status)

  let data: any = null

  try {
    data = await res.json()
  } catch (err) {
    console.warn("No JSON body returned")
  }

  console.log("response data:", data)

  if (!res.ok) {
    const message =
      data?.message ||
      data?.errors?.[0]?.message ||
      "Cannot check ward membership"

    throw new Error(message)
  }

  return data
}