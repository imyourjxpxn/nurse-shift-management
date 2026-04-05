// features/ward/api/getWardMembers.ts
import { apiFetch } from '@/lib/api-client'

export interface WardMember {
  userId: string;
  firstName: string;
  lastName: string;
  role: string; 
}

export async function getAllWardMembers(wardId: string): Promise<WardMember[]> {
  // เรียกตาม Path ใน Postman: /api/ward-member/getAll/:wardId
  const url = `/api/ward-member/getAll/${wardId}`;
  
  const response = await apiFetch(url, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error('โหลดรายชื่อสมาชิกวอร์ดไม่สำเร็จ');
  }
  
  return response.json(); 
}