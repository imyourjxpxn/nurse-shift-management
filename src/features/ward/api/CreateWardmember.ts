import { apiFetch } from '@/lib/api-client'

export async function CreateWardmember(
  wardId: string,
  joinCode: string
) {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ward/${wardId}/join`,
    {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }
  )

  if (!res.ok) {
    throw new Error('Join ward failed')
  }

  return res.json()
}