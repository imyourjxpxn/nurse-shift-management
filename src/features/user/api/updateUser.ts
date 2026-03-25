import { apiFetch } from '@/lib/api-client'

export interface UpdateUserRequest {
  displayName: string;
}

export async function updateUser(data: UpdateUserRequest) {
  // แยก displayName ออกเป็น firstName และ lastName
  const parts = data.displayName.trim().split(/\s+/); // แยกด้วยช่องว่าง
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || ''; // กรณีมีนามสกุลหลายพยางค์

  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
    method: 'PATCH', 
    body: JSON.stringify({
      firstName,
      lastName
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'ไม่สามารถเปลี่ยนชื่อได้')
  }

  return res.json()
}