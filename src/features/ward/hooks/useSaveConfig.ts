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

  const handleSave = async (
    configData: Record<string, ShiftSyncData>,
    pendingAssignments: any[],
    onSuccess: () => void
  ) => {
    
    if (!isFormValid) {
      setValidationErrors(validationMsg);
      setIsSidebarOpen(true);
      return; 
    }

    setValidationErrors([]); 

    try {
      setIsSaving(true);
      
      // 🚩 เช็คก่อนว่าเป็นการสร้างใหม่ (Create) หรืออัปเดต (Update)
      // โดยดูว่ามี shiftTemplateId ครบทุกเวรหรือยัง
      const isUpdateMode = Object.values(configData).every(d => !!d.shiftTemplateId);
      
      let currentTemplates = [];

      if (!isUpdateMode) {
        // --- STEP 1: เฉพาะกรณี "สร้างใหม่ครั้งแรก" เท่านั้น ---
        const templatePayload = Object.entries(configData).map(([type, data]) => ({
          wardId,
          type: type.toLowerCase(), 
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople) || 0
        }));

        // ยิง API สร้าง Template
        currentTemplates = await createShiftTemplate(templatePayload);
      } else {
        // ถ้าเป็นโหมด Update ไม่ต้องยิง API สร้างใหม่ ให้ใช้ข้อมูลจาก configData ได้เลย
        console.log("⚡ Update Mode: Skipping template creation");
      }

      // --- STEP 2: Update Requirements (ยิงทุกครั้งที่มีการกดเซฟ) ---
      const requirementPromises = Object.entries(configData).map(async ([type, data]) => {
        
        // 1. หา ID: ถ้าสร้างใหม่เอาจาก currentTemplates ถ้าอัปเดตเอาจาก configData
        let templateId = data.shiftTemplateId;

        if (!templateId && !isUpdateMode) {
          const target = currentTemplates?.find((item: any) => 
            (item?.type || "").toLowerCase() === type.toLowerCase()
          );
          templateId = target?.shiftTemplateId;
        }

        if (!templateId) {
          throw new Error(`ไม่พบรหัสเทมเพลตสำหรับเวร ${type} กรุณารีเฟรชหน้าเว็บ`);
        }

        // ยิง API อัปเดตจำนวนคนที่ต้องการ (Requirement)
        return createShiftRequirement(templateId, Number(data.requiredPeople));
      });

      await Promise.all(requirementPromises);

      // --- STEP 3: Save Assignments (บันทึกลงตาราง) ---
      const response = await createShiftAssignment(
        wardId, 
        year, 
        month, 
        pendingAssignments
      );

      // --- STEP 4: Success Handling ---
      setShowSuccessToast(true);
      onSuccess(); 

      const postSaveMessages: string[] = [];
      const missingDays = getMissingEmergencyDays(scheduleRows, pendingAssignments, daysInMonth);
      if (missingDays.length > 0) {
        postSaveMessages.push(`⚠️ วันที่ ${missingDays.join(', ')} ยังไม่มีเวร Emergency`);
      }

      const serverWarnings = response?.warning || [];
      const allWarnings = [...postSaveMessages, ...serverWarnings];

      if (allWarnings.length > 0) {
        setValidationErrors(allWarnings);
        setIsSidebarOpen(true); 
      } else {
        setIsSidebarOpen(false); 
      }

      setTimeout(() => setShowSuccessToast(false), 3000);

    } catch (err: any) {
      console.error("Save Error:", err);
      
      let thaiMsg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      const rawError = err.message || "";

      if (rawError.includes("limit exceeded")) {
        thaiMsg = "วอร์ดนี้มีข้อมูลเวรครบแล้ว ระบบจะข้ามไปอัปเดตจำนวนคนและตารางแทน";
      } else if (rawError.includes("already exists")) {
        thaiMsg = "ข้อมูลเวรนี้ถูกสร้างไว้แล้ว";
      } else if (rawError.includes("malformed")) {
        thaiMsg = "รหัสยืนยันตัวตนไม่ถูกต้อง กรุณาล็อกอินใหม่";
      } 
      setValidationErrors([thaiMsg]);
      setIsSidebarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, showSuccessToast, validationErrors, isSidebarOpen, setIsSidebarOpen, handleSave };
}