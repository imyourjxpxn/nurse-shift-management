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

export interface ShiftTemplate {
  shiftTemplateId: string;
  wardId: string;
  type: ShiftTemplateType;
  startTime: string;
  endTime: string;
  requiredPeople: number;
}

export enum ShiftTemplateType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night'
}

export enum AssignmentType {
  SHIFT = 'shift',
  OFF = 'off',
  LEAVE = 'leave',
  EMERGENCY = 'emergency',
  NONE = 'none'
}

export interface DayAssignment {
  date: string;
  shiftTemplateType: 'morning' | 'afternoon' | 'night' | null;
  assignmentType: AssignmentType;
}

export interface UserShiftAssignment {
  userId: string;
  name: string;
  userRole?: 'head_nurse' | 'nurse';
  assignments: DayAssignment[];
}

export interface NurseSummary {
  morning: number;
  afternoon: number;
  night: number;
  emergency: number;
  off: number;
  leave: number;
  totalShifts: number;
}

// UI Model สำหรับใช้ใน State ของหน้าตารางเวร
export interface NurseScheduleRow {
  displayName: string;
  dailyShifts: string[][]; // [dayIndex][shiftIndex] -> ["ช", "บ", "ด"]
  summary: NurseSummary;
}

export interface ShiftSyncData {
  shiftTemplateId?: string;
  startTime: string;
  endTime: string;
  requiredPeople: number;
  originalRequiredPeople?: number;
  hasError: boolean;
}