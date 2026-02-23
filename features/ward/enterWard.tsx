import { apiFetch } from '@/lib/api-client'
import { EnterWardResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * ใช้ตอนกด Enter Ward
 * - ถ้าเป็นสมาชิก → return ward detail
 * - ถ้าไม่เป็นสมาชิก → backend ควร return 403
 */

export async function enterWard(
  wardId: string
): Promise<EnterWardResponse> {

  const res = await apiFetch(
    `${BASE_URL}/api/ward/enterWard/${wardId}`
  )

  if (!res.ok) {
    throw new Error('Cannot fetch ward')
  }

  const data: EnterWardResponse = await res.json()

  return data
}
