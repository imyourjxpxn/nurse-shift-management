'use client'

import { useState } from 'react'
import { createShiftAssignment } from '@/features/ward/api/createShiftAssign' 
import { createShiftTemplate } from '@/features/ward/api/createShiftTemplate' 
import { createShiftRequirement } from '@/features/ward/api/createShiftRequirement' 
import { ShiftSyncData, ShiftTemplate } from '@/features/ward/types'
import { getMissingEmergencyDays } from '../utils/getMissingEmergency'

interface SaveConfigProps {
  wardId: string
  year: number
  month: number
  isFormValid: boolean
  validationMsg: string[]
  daysInMonth: number
  scheduleRows: any 
  shiftTemplates: ShiftTemplate[] // 🚩 เพิ่มตรงนี้เพื่อเอาไว้เทียบค่าเก่า
}

export function useSaveConfig({ 
  wardId, year, month, isFormValid, validationMsg, daysInMonth, scheduleRows, shiftTemplates 
}: SaveConfigProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ msg: string; type: 'error' | 'warning' }[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const translateError = (code: string, rawMessage: string): string => {
    const messages: Record<string, string> = {
      'DAY_ALREADY_HAS_ASSIGNMENT': 'มีการขึ้นเวรในวันที่เลือกอยู่แล้ว',
      'CONFLICTING_ASSIGNMENT_EXISTS': 'พบการลงเวรที่ทับซ้อนกัน',
      'WARD_ACCESS_DENIED': 'คุณไม่มีสิทธิ์แก้ไขข้อมูลวอร์ดนี้',
      'Unauthorized': 'เซสชันหมดอายุ กรุณาล็อกอินใหม่',
      'EXCEED_MAX_CONTINUOUS_WORK_HOUR': 'พบพยาบาลทำงานติดต่อกันเกิน 16 ชั่วโมง',
      'SHIFT_TEMPLATE_LIMIT_EXCEEDED': 'จำนวนประเภทเวรในวอร์ดนี้เต็มแล้ว (สูงสุด 3)',
      'SHIFT_TEMPLATE_TIME_OVERLAP': 'เวลาของเวรใหม่ทับซ้อนกับเวรที่มีอยู่เดิม',
    };
    return messages[code] || rawMessage || 'เกิดข้อผิดพลาดในการบันทึก';
  };

  const formatWarning = (rawMessage: string): string => {
    if (!rawMessage) return '';
    if (rawMessage.includes('SHIFT_REQUIREMENT_MISSING')) return 'จำนวนพยาบาลไม่ครบตามความต้องการของเวร';
    if (rawMessage.includes('USER_MISSING_ASSIGNMENT')) return 'มีพยาบาลบางท่านที่ยังไม่มีการลงเวรในเดือนนี้';
    return rawMessage; 
  };

  const handleSave = async (
    configData: Record<string, ShiftSyncData>, 
    pendingAssignments: any[], 
    onSuccess: () => void
  ) => {
    if (!isFormValid) {
      setValidationErrors(validationMsg.map(msg => ({ msg, type: 'error' })));
      setIsSidebarOpen(true);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      console.log("🛠️ [Start Save] Checking Data...");
      
      // --- STEP 1: Templates ---
      const isUpdateMode = Object.values(configData).every(d => !!d.shiftTemplateId);
      let currentTemplates: any[] = [];
      
      if (!isUpdateMode) {
        const payload = Object.entries(configData).map(([type, data]) => ({
          wardId, 
          type: type.toLowerCase().trim(), 
          startTime: data.startTime, 
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople) || 0
        }));
        const res = await createShiftTemplate(payload);
        currentTemplates = Array.isArray(res) ? res : (res?.data || []);
      }

      // --- STEP 2: Requirements (Fixed Logic) ---
      const requirementPromises = Object.entries(configData).map(async ([type, data]) => {
        let templateId = data.shiftTemplateId;
        const searchType = String(type).trim().toLowerCase();

        // 🔍 เทียบค่าเก่าจาก DB (shiftTemplates)
        const original = shiftTemplates.find(t => 
          t.shiftTemplateId === templateId || t.type.toLowerCase() === searchType
        );

        const newValue = Number(data.requiredPeople) || 0;
        const oldValue = original ? Number(original.requiredPeople) : -1;

        // 🚩 Console Check
        if (newValue === oldValue) {
          console.log(`✅ [Requirement] ${type.toUpperCase()}: คงที่ (${newValue}) -> ไม่ Update`);
          return null; 
        }

        console.log(`🔄 [Requirement] ${type.toUpperCase()}: เปลี่ยนจาก ${oldValue} เป็น ${newValue} -> กำลัง Update...`);

        if (!templateId && !isUpdateMode) {
          const target = currentTemplates?.find((item: any) => {
            const tType = item?.shiftTemplate?.type || item?.type || "";
            return String(tType).trim().toLowerCase() === searchType;
          });
          templateId = target?.shiftTemplate?.shiftTemplateId || target?.shiftTemplateId || target?.id;
        }

        if (!templateId) throw new Error(`ไม่พบ Template สำหรับเวร ${type}`);
        return createShiftRequirement(templateId, newValue);
      });

      // กรองเฉพาะอันที่ต้องยิง API จริงๆ
      const validReqPromises = requirementPromises.filter(p => p !== null);
      if (validReqPromises.length > 0) {
        await Promise.all(validReqPromises);
      }

      // --- STEP 3: Assignments (Original Safe Logic) ---
      console.log("🚀 [Step 3] Sending Data to Server...");
      const response = await createShiftAssignment(wardId, year, month, pendingAssignments);
      
      console.log("🔍 [DEBUG] Server Response:", response);

      const serverDetails = response?.details || response?.data?.details || [];
      const serverError = response?.error || response?.data?.error;

      if (serverError || (Array.isArray(serverDetails) && serverError?.code !== 'EMERGENCY_SHIFT_MISSING' && serverDetails.length > 0)) {
        throw { 
          code: serverError?.code || response?.code || 'VALIDATION_FAILED', 
          message: serverError?.message || response?.message, 
          details: serverDetails 
        };
      }

      // SUCCESS CASE
      setShowSuccessToast(true);
      setTimeout(() => {
        onSuccess();
        setShowSuccessToast(false);
      }, 1000);

      const finalWarnings: { msg: string; type: 'warning' }[] = [];
      const missingDays = getMissingEmergencyDays(scheduleRows, pendingAssignments, daysInMonth);
      if (missingDays.length > 0) {
        finalWarnings.push({ msg: `วันที่ ${missingDays.join(', ')} ยังไม่มีเวร Emergency`, type: 'warning' });
      }

      if (response?.warning && Array.isArray(response.warning)) {
        response.warning.forEach((msg: string) => {
          if (msg.toUpperCase().includes('EMERGENCY')) return; 
          const translatedMsg = formatWarning(msg);
          if (translatedMsg) finalWarnings.push({ msg: translatedMsg, type: 'warning' });
        });
      }

      setValidationErrors(finalWarnings);
      setIsSidebarOpen(finalWarnings.length > 0); 

    } catch (err: any) {
      console.error("🔴 [handleSave] Catch Block Triggered:", err);
      let finalErrors: { msg: string; type: 'error' | 'warning' }[] = [];
      const errorDetails = err.details || err.response?.data?.details || [];
      
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        const nurseMap = new Map();
        if (scheduleRows) {
          Object.entries(scheduleRows).forEach(([uid, data]: [string, any]) => {
            nurseMap.set(String(uid).trim(), data.displayName || data.name);
          });
        }
        errorDetails.forEach((info: any) => {
          if (info.userId && info.dates) {
            const targetId = String(info.userId).trim();
            const displayName = nurseMap.get(targetId) || `พยาบาล (${targetId.substring(0, 5)})`;
            const uniqueDays = Array.from(new Set<number>(info.dates.map((d: any) => new Date(d).getDate()))).sort((a, b) => a - b);
            finalErrors.push({ 
              msg: `${displayName}: ขึ้นเวรเกิน 16 ชม. (วันที่ ${uniqueDays.join(', ')})`, 
              type: 'error' 
            });
          }
        });
      }

      if (finalErrors.length === 0) {
        const errCode = err.code || err.response?.data?.code || '';
        const errMsg = err.message || err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก';
        const formatted = translateError(errCode, errMsg);
        const isWarning = formatted.includes('ไม่ครบ') || formatted.includes('ยังไม่มีการลงเวร');
        finalErrors.push({ msg: formatted, type: isWarning ? 'warning' : 'error' });
      }

      setValidationErrors(finalErrors);
      setIsSidebarOpen(true);
      setShowSuccessToast(false);
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, showSuccessToast, validationErrors, isSidebarOpen, setIsSidebarOpen, handleSave };
}