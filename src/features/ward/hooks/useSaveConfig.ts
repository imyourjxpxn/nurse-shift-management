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
      setValidationErrors([]);
      const requests: Promise<any>[] = [];

      // กรองเฉพาะรายการที่ไม่มี Error เท่านั้น
      const validEntries = Object.entries(configData).filter(([_, data]) => !data.hasError);

      // 1. สร้าง Template ใหม่ (ถ้าไม่มี ID)
      const templatesToCreate = validEntries
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

      // 2. อัปเดต Requirement (ถ้ามี ID แล้ว)
      const requirementsToUpdate = validEntries
        .filter(([_, data]) => data.shiftTemplateId);

      requirementsToUpdate.forEach(([_, data]) => {
        requests.push(createShiftRequirement(
          data.shiftTemplateId!, 
          Number(data.requiredPeople)
        ));
      });

      if (requests.length === 0) {
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);

      // สำเร็จ
      setShowSuccessToast(true);
      setIsSidebarOpen(false);
      onSuccess(); // สำคัญ: ต้อง Re-fetch ข้อมูลใหม่ในหน้านี้
      setTimeout(() => setShowSuccessToast(false), 3000);
    
    } catch (err: any) {
      setValidationErrors([err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"]);
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