'use client'

import { useState } from 'react'
import { createShiftAssignment } from '@/features/ward/api/createShiftAssign' 
import { createShiftTemplate } from '@/features/ward/api/createShiftTemplate' 
import { createShiftRequirement } from '@/features/ward/api/createShiftRequirement' 
import { ShiftSyncData } from '@/features/ward/types'
import { getMissingEmergencyDays } from '../utils/getMissingEmergency'

interface SaveConfigProps {
  wardId: string
  year: number
  month: number
  isFormValid: boolean
  validationMsg: string[]
  daysInMonth: number
  scheduleRows: any 
}

export function useSaveConfig({ 
  wardId, year, month, isFormValid, validationMsg, daysInMonth, scheduleRows 
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
    // 1. เช็ค Validation หน้าบ้าน (เช่น ลืมกรอกข้อมูล)
    if (!isFormValid) {
      setValidationErrors(validationMsg.map(msg => ({ msg, type: 'error' })));
      setIsSidebarOpen(true);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      
      // --- STEP 1 & 2: Templates & Requirements ---
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

      const requirementPromises = Object.entries(configData).map(async ([type, data]) => {
        let templateId = data.shiftTemplateId;
        if (!templateId && !isUpdateMode) {
          const searchType = String(type).trim().toLowerCase();
          const target = currentTemplates?.find((item: any) => {
            const tType = item?.shiftTemplate?.type || item?.type || "";
            return String(tType).trim().toLowerCase() === searchType;
          });
          templateId = target?.shiftTemplate?.shiftTemplateId || target?.shiftTemplateId || target?.id;
        }
        if (!templateId) throw new Error(`ไม่พบ Template สำหรับเวร ${type}`);
        return createShiftRequirement(templateId, Number(data.requiredPeople));
      });
      await Promise.all(requirementPromises);

      // --- STEP 3: Assignments ---
      console.log("🚀 [Step 3] Sending Data to Server...");
      const response = await createShiftAssignment(wardId, year, month, pendingAssignments);
      
      // 🚩 [DEBUG] ดูค่าจริงที่ Server ส่งกลับมา
      console.log("🔍 [DEBUG] Server Response:", response);

      // 🚩 [SAFETY CHECK] ดัก Error 16 ชม. หรือ Error อื่นๆ ที่อาจซ่อนอยู่ใน Response 200
      const serverDetails = response?.details || response?.data?.details || [];
      const serverError = response?.error || response?.data?.error;

      if (serverError || (Array.isArray(serverDetails) && serverDetails.length > 0)) {
        console.warn("🚫 [Validation Failed] Server returned error details. Stop saving.");
        
        // โยน Error เพื่อให้โดดไปทำงานที่ catch block ด้านล่าง
        throw { 
          code: serverError?.code || response?.code || 'VALIDATION_FAILED', 
          message: serverError?.message || response?.message, 
          details: serverDetails 
        };
      }

      // ✅ [SUCCESS CASE] จะมาถึงตรงนี้ได้ ต้องไม่มี Error Details เท่านั้น
      setShowSuccessToast(true);
      
      // หน่วงเวลาให้ Toast โชว์นิดนึงก่อนสั่ง onSuccess (ซึ่งมักจะไปปิด Modal หรือเปลี่ยนหน้า)
      setTimeout(() => {
        onSuccess();
        setShowSuccessToast(false);
      }, 1000);

      // จัดการ Warning หลังเซฟสำเร็จ
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
      
      // พยายามดึง Details จากทุกจุดที่เป็นไปได้
      const errorDetails = err.details || err.response?.data?.details || [];
      
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        const nurseMap = new Map();
        if (scheduleRows) {
          Object.entries(scheduleRows).forEach(([uid, data]: [string, any]) => {
            nurseMap.set(String(uid).trim(), data.displayName || data.name || data.nurseName);
          });
        }

        errorDetails.forEach((info: any) => {
          // ดักเคส 16 ชม. (ต้องมี userId และ dates)
          if (info.userId && info.dates) {
            const targetId = String(info.userId).trim();
            const displayName = nurseMap.get(targetId) || `พยาบาล (ID: ${targetId.substring(0, 5)})`;
            const uniqueDays = Array.from(new Set<number>(info.dates.map((d: any) => new Date(d).getDate()))).sort((a, b) => a - b);
            
            finalErrors.push({ 
              msg: `${displayName}: ขึ้นเวรเกิน 16 ชม. (วันที่ ${uniqueDays.join(', ')})`, 
              type: 'error' 
            });
          }
        });
      }

      // ถ้าไม่มี Error 16 ชม. ให้เช็ค Error ทั่วไปจาก Code/Message
      if (finalErrors.length === 0) {
        const errCode = err.code || err.response?.data?.code || '';
        const errMsg = err.message || err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก';
        const formatted = translateError(errCode, errMsg);
        
        const isWarning = formatted.includes('ไม่ครบ') || formatted.includes('ยังไม่มีการลงเวร');
        finalErrors.push({ msg: formatted, type: isWarning ? 'warning' : 'error' });
      }

      setValidationErrors(finalErrors);
      setIsSidebarOpen(true);
      setShowSuccessToast(false); // ป้องกัน Toast เขียวโผล่ตอนพัง
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, showSuccessToast, validationErrors, isSidebarOpen, setIsSidebarOpen, handleSave };
}