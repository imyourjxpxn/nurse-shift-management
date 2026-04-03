'use client'

import { useState } from 'react'
import { createShiftTemplate } from '@/features/ward/api/createShiftTemplate'
import { createShiftRequirement } from '@/features/ward/api/createShiftRequirement'
import { createShiftAssignment } from '@/features/ward/api/createShiftAssign'
import { ShiftSyncData } from '@/features/ward/types'

interface SaveConfigProps {
  wardId: string
  year: number
  month: number // รับ 0-11
  isFormValid: boolean
  validationMsg: string[]
}

export function useSaveConfig({ wardId, year, month, isFormValid, validationMsg }: SaveConfigProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleSave = async (
    configData: Record<string, ShiftSyncData>,
    pendingAssignments: any[],
    onSuccess: () => void
  ) => {
    // 1. Validate ข้อมูลเบื้องต้น
    if (!isFormValid) {
      setValidationErrors(validationMsg);
      setIsSidebarOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);
      
      // ตัวแปรสำหรับถือข้อมูล Assignment ที่อาจต้องอัปเดต ID ใหม่
      let finalAssignments = [...pendingAssignments];
      const subsequentRequests: Promise<any>[] = [];

      // --- 🔍 STEP 1: จัดการ Shift Template (Create New) ---
      const templatesToCreate = Object.entries(configData)
        .filter(([_, data]) => !data.shiftTemplateId && !data.hasError)
        .map(([type, data]) => ({
          wardId,
          type,
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople)
        }));

      if (templatesToCreate.length > 0) {
        console.log("⏳ [Step 1] Creating new templates...");
        // 🚩 สำคัญ: ต้องให้ createShiftTemplate คืนค่า Array ของ Template ที่มี ID ใหม่มาด้วย
        const newlyCreated = await createShiftTemplate(templatesToCreate); 

        // 🚩 Mapping ID ใหม่กลับเข้าไปใน pendingAssignments
        finalAssignments = finalAssignments.map(item => {
          if (item.assignmentType === 'shift' || ['morning', 'afternoon', 'night'].includes(item.templateType)) {
             // หา Template ที่เพิ่งสร้างใหม่ที่ตรงกับ Type ของ Assignment นี้
             const match = newlyCreated.find((t: any) => t.type === item.templateType);
             if (match) {
               return { ...item, shiftTemplateId: match.shiftTemplateId };
             }
          }
          return item;
        });
      }

      // --- 🔍 STEP 2: จัดการ Requirement (Update Existing) ---
      Object.entries(configData).forEach(([_, data]) => {
        const isExisting = !!data.shiftTemplateId;
        const isChanged = Number(data.requiredPeople) !== Number(data.originalRequiredPeople);
        
        if (isExisting && isChanged) {
          subsequentRequests.push(createShiftRequirement(
            data.shiftTemplateId!, 
            Number(data.requiredPeople)
          ));
        }
      });

      // --- 🔍 STEP 3: จัดการ Shift Assignment (ตารางเวร) ---
      if (finalAssignments.length > 0) {
        const apiPayload = finalAssignments.map(item => ({
          userId: item.userId,
          date: item.date, // Format YYYY-MM-DD
          assignmentType: item.assignmentType.toLowerCase(),
          // ใช้ ID ที่ได้มาจากการ Map ใน Step 1
          ...(item.shiftTemplateId && { shiftTemplateId: item.shiftTemplateId })
        }));

        console.log("🚀 [Step 3] Sending Assignments:", apiPayload);
        
        subsequentRequests.push(createShiftAssignment(
          wardId, 
          year, 
          month, 
          apiPayload
        ));
      }

      // --- 🚀 Execute All Remaining Requests ---
      if (subsequentRequests.length > 0) {
        await Promise.all(subsequentRequests);
        console.log("✨ Save Completed!");
      } else if (templatesToCreate.length === 0) {
        setIsSaving(false);
        return;
      }

      // --- ✅ Success Logic ---
      setShowSuccessToast(true);
      setIsSidebarOpen(false);
      onSuccess(); // ในนี้ต้องมี setPendingAssignments([]) และ refreshData()
      setTimeout(() => setShowSuccessToast(false), 3000);

    } catch (err: any) {
      console.error("❌ Save Error:", err);
      setValidationErrors([err.message || "เกิดข้อผิดพลาดในการบันทึก"]);
      setIsSidebarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    showSuccessToast,
    validationErrors,
    isSidebarOpen,
    setIsSidebarOpen,
    handleSave
  }
}