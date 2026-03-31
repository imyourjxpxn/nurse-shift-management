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
      const requests: Promise<any>[] = [];

      // --- 🚩 แยก Logic ตาม API ของเพื่อน ---

      // 1. กลุ่มที่ต้อง "สร้างใหม่ทั้งหมด" (กรณีวอร์ดใหม่ ยังไม่มี ID ของเวรเลย)
      // เพื่อนบอกว่าส่งเป็น Array ไปที่ /api/shift-template/create
      const templatesToCreate = Object.entries(configData)
        .filter(([_, data]) => !data.shiftTemplateId) // ถ้าไม่มี ID แสดงว่าต้องสร้างครั้งแรก
        .map(([type, data]) => ({
          wardId: wardId,
          type: type,
          startTime: data.startTime,
          endTime: data.endTime,
          requiredPeople: Number(data.requiredPeople)
        }));

      if (templatesToCreate.length > 0) {
        console.log("🆕 ยิงเส้น Create Template (ครั้งแรก):", templatesToCreate);
        requests.push(createShiftTemplate(templatesToCreate));
      }

      // 2. กลุ่มที่ "มีเวรอยู่แล้ว" แต่ต้องการแก้ไขจำนวนคน (Update Requirement)
      // เพื่อนบอกว่าให้ยิงแยกรายตัวไปที่ /api/shift-requirement/create/:shiftTemplateId
      const requirementsToUpdate = Object.entries(configData)
        .filter(([_, data]) => data.shiftTemplateId); // มี ID แล้ว แสดงว่าเป็นการแก้จำนวนคน

      if (requirementsToUpdate.length > 0) {
        console.log("✏️ ยิงเส้น Create Requirement (อัปเดตจำนวนคน)");
        requirementsToUpdate.forEach(([_, data]) => {
          // ยิงแยกทีละตัวตาม Requirement ของเพื่อน
          requests.push(createShiftRequirement(
            data.shiftTemplateId!, 
            Number(data.requiredPeople)
          ));
        });
      }

      // --- 🚩 ยิง API ทั้งหมดพร้อมกัน ---
      await Promise.all(requests);

      // สำเร็จ
      setValidationErrors([]);
      setIsSidebarOpen(false);
      onSuccess(); // Refresh ข้อมูลเพื่อดึงค่าล่าสุดมาโชว์
    
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