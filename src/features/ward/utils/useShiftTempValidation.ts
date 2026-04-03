// features/ward/hooks/useShiftValidation.ts
import { useMemo } from 'react';
import { ShiftSyncData, ShiftTemplateType } from '@/features/ward/types';

export function useShiftValidation(configData: Record<string, ShiftSyncData>) {
  return useMemo(() => {
    const types = [
      ShiftTemplateType.MORNING, 
      ShiftTemplateType.AFTERNOON, 
      ShiftTemplateType.NIGHT
    ];
    
    // 1. เช็คข้อมูลพื้นฐาน
    const hasAllKeys = types.every(type => !!configData[type]);
    if (!hasAllKeys) return { isValid: false, messages: ["⚠️ กำลังโหลดข้อมูล.."] };

    // 2. เช็คโหมด
    const isUpdateMode = types.every(type => !!configData[type].shiftTemplateId);

    // 3. เช็คความครบถ้วน (เวลา + จำนวนคน)
    const errors: string[] = [];
    
    const isReadyToSave = types.every(type => {
      const d = configData[type];
      const hasPeople = Number(d.requiredPeople) > 0;
      const noError = !d.hasError;

      if (isUpdateMode) return hasPeople && noError;
      
      const hasTime = d.startTime && d.startTime !== "--:--" && d.endTime && d.endTime !== "--:--";
      return hasTime && hasPeople && noError;
    });

    if (!isReadyToSave) {
      errors.push(isUpdateMode 
        ? "กรุณาระบุ 'จำนวนพยาบาล' (> 0) ในเวรที่ต้องการแก้ไข" 
        : "กรุณากรอก 'เวลา' และ 'จำนวนพยาบาล' ให้ครบทั้ง 3 เวร"
      );
    }

    // 🚩 4. เช็ค Overlap (Cross-Check ทุกคู่)
    if (!isUpdateMode && isReadyToSave) {
      const toMin = (t: string) => {
        const [h, min] = t.split(':').map(Number);
        return h * 60 + min;
      };

      // ฟังก์ชันช่วยเช็คการทับซ้อน (รองรับเวรข้ามคืน)
      const checkOverlap = (t1: string, t2: string) => {
        const s1 = toMin(configData[t1].startTime);
        let e1 = toMin(configData[t1].endTime);
        const s2 = toMin(configData[t2].startTime);
        let e2 = toMin(configData[t2].endTime);

        if (e1 <= s1) e1 += 1440; // ถ้าเลิกงานเช้าอีกวัน +24 ชม.
        if (e2 <= s2) e2 += 1440;

        return s1 < e2 && s2 < e1;
      };

      const typeLabels: Record<string, string> = {
        [ShiftTemplateType.MORNING]: "เวรเช้า",
        [ShiftTemplateType.AFTERNOON]: "เวรบ่าย",
        [ShiftTemplateType.NIGHT]: "เวรดึก"
      };

      // วนลูปเช็คทุกคู่: เช้า-บ่าย, เช้า-ดึก, บ่าย-ดึก
      for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
          if (checkOverlap(types[i], types[j])) {
            errors.push(`เวลาของ ${typeLabels[types[i]]} ทับซ้อนกับ ${typeLabels[types[j]]}`);
          }
        }
      }
    }

    // ส่งคืนเป็น Array ของข้อความ (messages)
    return { 
      isValid: errors.length === 0, 
      messages: errors 
    };

  }, [configData]);
}