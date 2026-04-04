'use client'

import { useMemo } from 'react';
import { ShiftSyncData, ShiftTemplateType } from '@/features/ward/types';

export function useShiftValidation(configData: Record<string, ShiftSyncData>) {
  return useMemo(() => {
    const types = [
      ShiftTemplateType.MORNING, 
      ShiftTemplateType.AFTERNOON, 
      ShiftTemplateType.NIGHT
    ];
    
    const typeLabels: Record<string, string> = {
      [ShiftTemplateType.MORNING]: "เวรเช้า",
      [ShiftTemplateType.AFTERNOON]: "เวรบ่าย",
      [ShiftTemplateType.NIGHT]: "เวรดึก"
    };

    const hasAllKeys = types.every(type => !!configData[type]);
    if (!hasAllKeys) return { isValid: false, messages: ["กำลังโหลดข้อมูล.."] };

    const isUpdateMode = types.every(type => !!configData[type].shiftTemplateId);
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
        ? "กรุณาระบุ 'จำนวนพยาบาล' ในเวรที่ต้องการแก้ไข (ต้องมากกว่า 0)" 
        : "กรุณากรอก 'เวลา' และ 'จำนวนพยาบาล' ให้ครบทั้ง 3 เวร"
      );
    }

    const toMin = (t: string) => {
      if (!t || t === "--:--" || t === "") return 0;
      const [h, min] = t.split(':').map(Number);
      return (h * 60) + min;
    };

    if (!isUpdateMode && isReadyToSave) {
      const mStart = toMin(configData[ShiftTemplateType.MORNING].startTime);
      const aStart = toMin(configData[ShiftTemplateType.AFTERNOON].startTime);
      const nStart = toMin(configData[ShiftTemplateType.NIGHT].startTime);

      // 🚩 Logic ใหม่: ตรวจสอบลำดับแบบ Strict
      // บ่ายต้องเริ่มหลังเช้า และ ดึกต้องเริ่มหลังบ่าย 
      // โดยยอมให้ "ข้ามวัน" ได้แค่กรณีเดียวคือเวลาเวรถัดไป 'น้อยกว่า' เวรก่อนหน้า (เช่น 16:00 -> 00:00)
      
      let effectiveAfternoon = aStart;
      if (effectiveAfternoon < mStart) effectiveAfternoon += 1440;

      let effectiveNight = nStart;
      if (effectiveNight < effectiveAfternoon) effectiveNight += 1440;

      // เช็คว่าถ้าเรียงลำดับแบบข้ามวันแล้ว มันดันย้อนกลับมาห่างจากจุดเริ่มเกิน 24 ชม.
      // หรือค่า Raw เริ่มต้นมันขัดกับลำดับพื้นฐาน (ช -> บ -> ด) ในวันเดียวกัน
      const isSequenceBroken = 
        (aStart < mStart && (effectiveAfternoon - mStart >= 1440)) || // บ่ายย้อนไปก่อนเช้า
        (nStart < aStart && (effectiveNight - aStart >= 1440)) ||     // ดึกย้อนไปก่อนบ่าย
        (nStart < mStart && nStart > aStart);                         // ดึกแทรกกลางแบบผิดๆ

      if (aStart === mStart || nStart === aStart || nStart === mStart) {
        errors.push("เวลาเริ่มของแต่ละเวรต้องไม่ซ้ำกันครับ");
      }
      else if (aStart < mStart || nStart < aStart) {
        // ถ้าค่าดิบ (Raw) มันย้อนกลับ เช่น บ่ายเริ่ม 06:00 แต่เช้าเริ่ม 08:00
        // เราจะเช็คว่ามันเป็นการตั้งใจให้เป็น "วันถัดไป" จริงๆ หรือกรอกผิด
        // โดยปกติเวร 3 ผลัด (ช,บ,ด) จะต้องจบภายในรอบ 24 ชม.
        if (effectiveNight - mStart >= 1440) {
          errors.push("ลำดับเวลาผิดปกติ: เวรทั้ง 3 ผลัดควรอยู่ในรอบ 24 ชั่วโมง และเรียงลำดับ เช้า -> บ่าย -> ดึก ครับ");
        }
      }

      const checkOverlap = (t1: ShiftTemplateType, t2: ShiftTemplateType) => {
        const s1 = toMin(configData[t1].startTime);
        let e1 = toMin(configData[t1].endTime);
        const s2 = toMin(configData[t2].startTime);
        let e2 = toMin(configData[t2].endTime);
        if (e1 <= s1) e1 += 1440; 
        if (e2 <= s2) e2 += 1440;
        const isOverlap = (as: number, ae: number, bs: number, be: number) => as < be && bs < ae;
        return (
          isOverlap(s1, e1, s2, e2) || 
          isOverlap(s1, e1, s2 + 1440, e2 + 1440) ||
          isOverlap(s1 + 1440, e1 + 1440, s2, e2)
        );
      };

      const checkedPairs = new Set<string>();
      for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
          if (checkOverlap(types[i], types[j])) {
            const pairKey = [types[i], types[j]].sort().join('-');
            if (!checkedPairs.has(pairKey)) {
              errors.push(`เวลาของ '${typeLabels[types[i]]}' และ '${typeLabels[types[j]]}' ทับซ้อนกันอยู่ครับ`);
              checkedPairs.add(pairKey);
            }
          }
        }
      }
    }

    return { isValid: errors.length === 0, messages: errors };
  }, [configData]);
}