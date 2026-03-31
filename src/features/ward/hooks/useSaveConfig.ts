import { useState } from 'react'
import { createShiftTemplate } from '@/features/ward/api/createShiftTemplate'
import { createShiftRequirement } from '@/features/ward/api/createShiftRequirement'
import { ShiftSyncData } from '@/features/ward/types'

interface SaveConfigProps {
  wardId: string
  isFormValid: boolean
  validationMsg: string[]
}

export function useSaveConfig({ wardId, isFormValid, validationMsg }: SaveConfigProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // 🚩 เพิ่ม State สำหรับ Success Toast
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleSave = async (
    configData: Record<string, ShiftSyncData>,
    onSuccess: () => void
  ) => {
    if (!isFormValid) {
      setValidationErrors(validationMsg);
      setIsSidebarOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      setShowSuccessToast(false); // ปิดอันเก่าก่อนถ้ามี
      const requests: Promise<any>[] = [];

      // 1. กลุ่มสร้างใหม่
      const templatesToCreate = Object.entries(configData)
        .filter(([_, data]) => !data.shiftTemplateId)
        .map(([type, data]) => ({
          wardId: wardId,
          type: type,
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople)
        }));

      if (templatesToCreate.length > 0) {
        requests.push(createShiftTemplate(templatesToCreate));
      }

      // 2. กลุ่มอัปเดตจำนวนคน
      const requirementsToUpdate = Object.entries(configData)
        .filter(([_, data]) => data.shiftTemplateId);

      if (requirementsToUpdate.length > 0) {
        requirementsToUpdate.forEach(([_, data]) => {
          requests.push(createShiftRequirement(
            data.shiftTemplateId!, 
            Number(data.requiredPeople)
          ));
        });
      }

      await Promise.all(requests);

      // ✅ บันทึกสำเร็จ
      setValidationErrors([]);
      setIsSidebarOpen(false);
      setShowSuccessToast(true); // 🚩 แสดง Toast สำเร็จ
      onSuccess(); 

      // 🚩 ตั้งเวลาให้ Toast หายไปเองใน 3 วินาที
      setTimeout(() => setShowSuccessToast(false), 3000);
    
    } catch (err: any) {
      console.error("Save Error:", err);
      setValidationErrors([err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"]);
      setIsSidebarOpen(true);
      setShowSuccessToast(false);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    showSuccessToast, // 🚩 ส่งออกไปด้วย
    setShowSuccessToast,
    validationErrors,
    setValidationErrors,
    isSidebarOpen,
    setIsSidebarOpen,
    handleSave
  }
}