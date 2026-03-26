 import { apiFetch } from '@/lib/api-client'
import { User } from '@/features/user/types'


export async function updateUser(data: Pick<User, 'firstName' | 'lastName'>) {

  // data จะมีแค่ firstName และ lastName ตามที่เรา Pick มาจาก User

  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {

    method: 'PATCH',
    body: JSON.stringify(data),

  })

 
  if (!res.ok) {

    const error = await res.json()
    throw new Error(error.message || 'ไม่สามารถเปลี่ยนชื่อได้')

  }

  return res.json()

}