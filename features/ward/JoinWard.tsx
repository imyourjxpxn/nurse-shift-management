import { apiFetch } from '@/lib/api-client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function joinWard(
  wardId: string,
  joinCode: string
) {
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
    throw new Error(data?.message || 'Invalid join code')
  }

  return data
}