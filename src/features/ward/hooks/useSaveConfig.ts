import { useState } from 'react'
import { createShiftTemplate } from '@/features/ward/api/createShiftTemplate'
import { createShiftRequirement } from '@/features/ward/api/createShiftRequirement' // 🚩 ใช้ API ตัวใหม่ที่ส่งราย ID
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

  // features/ward/hooks/useSaveConfig.ts

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

      // 🚩 1. แยกกลุ่มข้อมูล: กลุ่มที่จะ Create ใหม่ vs กลุ่มที่มี ID แล้วจะ Update Requirement
      const toCreateTemplate = Object.entries(configData)
        .filter(([_, data]) => !data.shiftTemplateId) // ไม่มี ID = ของใหม่
        .map(([type, data]) => ({
          wardId: wardId,
          type: type,
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople)
        }));

      const toUpdateRequirement = Object.entries(configData)
        .filter(([_, data]) => data.shiftTemplateId); // มี ID แล้ว = แก้จำนวนคน

      // 🚩 2. จัดการยิง API
      const requests: Promise<any>[] = [];

      // ถ้ามีของใหม่ -> ยิง createShiftTemplate (ทีเดียวเข่งใหญ่)
      if (toCreateTemplate.length > 0) {
        console.log("🆕 Creating new templates:", toCreateTemplate);
        requests.push(createShiftTemplate(toCreateTemplate));
      }

      // ถ้ามีของเดิม -> วนลูปยิง createShiftRequirement (แยกราย ID)
      if (toUpdateRequirement.length > 0) {
        console.log("update existing requirements");
        toUpdateRequirement.forEach(([_, data]) => {
          requests.push(createShiftRequirement(data.shiftTemplateId!, data.requiredPeople));
        });
      }

      // 🚩 3. ยิงทุกอย่างพร้อมกัน
      await Promise.all(requests);

      // 4. สำเร็จ
      setValidationErrors([]);
      setIsSidebarOpen(false);
      onSuccess(); // Refresh ข้อมูลเพื่อให้ได้ ID ใหม่มาเก็บไว้ในเครื่อง
    
    } catch (err: any) {
      console.error("Save Error:", err);
      setValidationErrors([err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"]);
      setIsSidebarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    validationErrors,
    setValidationErrors,
    isSidebarOpen,
    setIsSidebarOpen,
    handleSave
  }
}