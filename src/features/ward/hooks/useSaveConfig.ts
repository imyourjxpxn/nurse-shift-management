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
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const translateError = (code: string, rawMessage: string): string => {
    if (!rawMessage) return '';
    const messages: Record<string, string> = {
      'DAY_ALREADY_HAS_ASSIGNMENT': '❌ มีการขึ้นเวรในวันที่เลือกอยู่แล้ว',
      'CONFLICTING_ASSIGNMENT_EXISTS': '❌ พบการลงเวรที่ทับซ้อนกัน',
      'WARD_ACCESS_DENIED': '❌ คุณไม่มีสิทธิ์แก้ไขข้อมูลวอร์ดนี้',
      'Unauthorized': '❌ เซสชันหมดอายุ กรุณาล็อกอินใหม่',
    };
    return messages[code] || `❌ ${rawMessage}`;
  };

  const formatWarning = (rawMessage: string): string => {
    if (!rawMessage) return '';
    if (rawMessage.toLowerCase().includes("16 continuous working hours")) {
      const nameMatch = rawMessage.match(/User\s+(.+?)\s+exceeds/i);
      const dateMatch = rawMessage.match(/on\s+(\d{4}-\d{2}-\d{2})/i);
      const userName = nameMatch ? nameMatch[1] : "พยาบาล";
      const dateStr = dateMatch ? new Date(dateMatch[1]).getDate() : "";
      return `⚠️ ${userName} ทำงานติดต่อกันเกิน 16 ชม. (วันที่ ${dateStr})`;
    }
    // 2. จัดการ Warning ตาม WarningType (Enum)
    if (rawMessage.includes('SHIFT_REQUIREMENT_MISSING')) return '⚠️ จำนวนพยาบาลไม่ครบตามความต้องการของเวร';
    if (rawMessage.includes('EMERGENCY_SHIFT_MISSING')) return '⚠️ ยังไม่ได้ระบุพยาบาลสำหรับเวร Emergency';
    if (rawMessage.includes('USER_MISSING_ASSIGNMENT')) return '⚠️ มีพยาบาลบางท่านยังไม่มีการลงเวรในเดือนนี้';

    return `⚠️ ${rawMessage}`; 
  };
  

  const handleSave = async (
    configData: Record<string, ShiftSyncData>, 
    pendingAssignments: any[], 
    onSuccess: () => void
  ) => {
    if (!isFormValid) {
      setValidationErrors(validationMsg.map(msg => `❌ ${msg}`));
      setIsSidebarOpen(true);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      
      // --- STEP 1: Templates ---
      const isUpdateMode = Object.values(configData).every(d => !!d.shiftTemplateId);
      let currentTemplates: any[] = [];

      if (!isUpdateMode) {
        const templatePayload = Object.entries(configData).map(([type, data]) => ({
          wardId,
          type: type.toLowerCase(), 
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople) || 0
        }));
        currentTemplates = await createShiftTemplate(templatePayload);
      }

      // --- STEP 2: Requirements ---
      const requirementPromises = Object.entries(configData).map(async ([type, data]) => {
        let templateId = data.shiftTemplateId;
        if (!templateId && !isUpdateMode) {
          const target = currentTemplates?.find((item: any) => 
            (item?.type || "").toLowerCase() === type.toLowerCase()
          );
          templateId = target?.shiftTemplateId;
        }
        if (!templateId) throw new Error(`ไม่พบ Template สำหรับเวร ${type}`);
        return createShiftRequirement(templateId, Number(data.requiredPeople));
      });
      await Promise.all(requirementPromises);

      // --- STEP 3: Assignments ---
      const response = await createShiftAssignment(wardId, year, month, pendingAssignments);

      console.log("🟢 Save Success Response:", response);

      // ✅ SUCCESS CASE
      setShowSuccessToast(true);
      
      setTimeout(() => {
        onSuccess(); 
      }, 500); // ดีเลย์ครึ่งวินาทีให้ UI นิ่งก่อน

      const postSaveMessages: string[] = [];
      const missingDays = getMissingEmergencyDays(scheduleRows, pendingAssignments, daysInMonth);
      if (missingDays.length > 0) {
        postSaveMessages.push(`⚠️ วันที่ ${missingDays.join(', ')} ยังไม่มีเวร Emergency`);
      }

      // ดึง Warning จาก Response 200
      if (response?.warning && Array.isArray(response.warning)) {
        const serverWarnings = response.warning.map((msg: string) => formatWarning(msg));
        postSaveMessages.push(...serverWarnings);
      }else {
        console.log("✅ No Server Warnings found in 200 OK"); // 🚩 เพิ่มเพื่อให้รู้ว่า "ไม่เจอ"
      }

      // สรุปการแสดงผล Sidebar
      if (postSaveMessages.length > 0) {
        setValidationErrors(postSaveMessages);
        setIsSidebarOpen(true); 
      } else {
        setIsSidebarOpen(false); // ปิดเฉพาะกรณีไม่มี Warning เท่านั้น
      }

      setTimeout(() => setShowSuccessToast(false), 3000);

    } catch (err: any) {
      console.error("🔴 Save Failed (Error Details):", err);
      
      let combinedErrors: string[] = [];
      const serverData = err.data || {}; 

      const mainMessage = err.message || "";
      if (mainMessage.toLowerCase().includes("16 continuous working hours")) {
        const translated = formatWarning(mainMessage).replace('⚠️', '❌');
        combinedErrors.push(translated);
      } else {
        combinedErrors.push(translateError(err.code || '', mainMessage));
      }

      if (serverData.errors && Array.isArray(serverData.errors)) {
        const extraErrors = serverData.errors.map((e: any) => translateError(e.code, e.message));
        combinedErrors.push(...extraErrors);
      }

      if (serverData.warning && Array.isArray(serverData.warning)) {
        const warnings = serverData.warning.map((msg: string) => formatWarning(msg));
        combinedErrors.push(...warnings);
      }

      setValidationErrors(Array.from(new Set(combinedErrors)).filter(Boolean));
      setIsSidebarOpen(true); 
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, showSuccessToast, validationErrors, isSidebarOpen, setIsSidebarOpen, handleSave };
}