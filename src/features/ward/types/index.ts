// features/ward/types.ts

export interface Ward {
  wardId: string
  wardName: string
  member: number
  createdBy: string
}

export interface WardDetail {
  wardId: string
  wardName: string
  hospitalId: string
  hospitalName: string
  joinCode: string
  joinCodeStatus: string
  status: string
  createdBy: string
  updatedBy: string

  userRole: 'head_nurse' | 'nurse'
}


export interface EnterWardResponse {
  wardId: string
  isMember: boolean
}

export enum ShiftTemplateType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night'
}

export interface ShiftTemplate {
  shiftTemplateId: string;
  wardId: string;
  type: ShiftTemplateType;
  startTime: string;
  endTime: string;
  requiredPeople: number;
}

export interface SaveShiftPayload {
  wardId: string
  type: ShiftTemplateType
  startTime: string
  endTime: string
  requiredPeople: number
  shiftTemplateId?: string // ส่งมาเพื่อบอกว่าเป็น Update
}


// ✅ เพิ่มอันนี้เข้าไปครับ สำหรับใช้รับ-ส่งข้อมูลระหว่าง Component
export interface ShiftSyncData {
  shiftTemplateId?: string;
  startTime: string;
  endTime: string;
  requiredPeople: number;
  hasError: boolean;
}

