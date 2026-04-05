import { apiFetch } from '@/lib/api-client'

// 🚩 แก้ไขชื่อ Property ให้เป็น camelCase ตามที่ Backend/Postman ใช้งานจริง
export interface CreateShiftSwapPayload {
  approverUserId: string;          // เดิม approver_user_id
  requesterAssignmentId: string;   // เดิม requester_assignment_id
  approverAssignmentId: string;    // เดิม approver_assignment_id
  note?: string | null;
}

export async function createShiftSwapRequest(payload: CreateShiftSwapPayload) {
  const url = `/api/shift-swap-request/create`; 
  
  // 🔍 [Debug] Log ก่อนส่งออกจากเครื่องไปหา Server
  console.log("📡 [apiFetch] Requesting to:", url);
  console.log("📦 [apiFetch] Payload body:", payload);

  const response = await apiFetch(url, {
    method: 'POST',
    // 🚩 สำคัญ: ส่ง payload ที่เป็น camelCase ไปเลย
    body: JSON.stringify(payload),
  });

  // เช็ค Error จาก apiFetch (ถ้า apiFetch handle response มาให้แล้วอาจจะไม่ต้อง .json() ซ้ำ)
  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ [apiFetch] Error response:", errorData);
    throw new Error(errorData.message || 'สร้างคำขอแลกเวรไม่สำเร็จ');
  }

  return response.json();
}