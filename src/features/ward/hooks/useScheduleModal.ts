'use client'

import { useState, useMemo, useCallback } from 'react';
import { deleteShiftAssignment } from '../api/deleteShiftAssign';
import { 
  NurseScheduleRow, 
  ShiftCellData 
} from '@/features/ward/types'; 

export function useScheduleModal(
  scheduleRows: Record<string, NurseScheduleRow>, 
  refreshData: () => void,
  pendingAssignments: any[]
) {
  const [selectedCell, setSelectedCell] = useState<{ userId: string; day: number } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalData = useMemo(() => {
    if (!selectedCell || !scheduleRows[selectedCell.userId]) {
      return { userId: "", nurseName: "", currentAssignments: [], day: 0, hasExistingNormal: false, hasExistingSpecial: false };
    }

    const nurse = scheduleRows[selectedCell.userId];
    const dayShiftsRaw = nurse.dailyShifts[selectedCell.day] || [];
    const assignments: ShiftCellData[] = dayShiftsRaw.filter((s): s is ShiftCellData => s !== null);

    const hasExistingNormal = assignments.some(a => 
      ['morning', 'afternoon', 'night'].includes(a.templateType || a.assignmentType)
    );
    const hasExistingSpecial = assignments.some(a => 
      ['emergency', 'leave', 'off'].includes(a.templateType || a.assignmentType)
    );

    return {
      userId: selectedCell.userId,
      nurseName: nurse.displayName,
      day: selectedCell.day,
      currentAssignments: assignments,
      hasExistingNormal,
      hasExistingSpecial
    };
  }, [selectedCell, scheduleRows]);

  const open = useCallback((userId: string, day: number) => {
    setSelectedCell({ userId, day });
    
    // ดึงค่าที่เคยเลือกไว้ (แต่ยังไม่ได้กดเซฟลง DB) มาแสดงไฮไลท์ขอบฟ้า
    // ตรวจสอบเรื่อง day + 1 ให้ดีว่า logic ฝั่งหน้าตารางใช้แบบไหน
    const existingPending = pendingAssignments
      .filter(p => p.userId === userId && p.day === (day + 1))
      .map(p => p.templateType || p.assignmentType);

    setSelectedTypes(existingPending);
  }, [pendingAssignments]);

  const handleSelectType = (type: string) => {
    const isSpecialInput = ['emergency', 'leave', 'off'].includes(type);
    
    // 🚩 1. เช็ค Conflict กับ DB (ถ้าติดเงื่อนไข ห้ามทำงานต่อ)
    // หมายเหตุ: UI จริงจะเทาปุ่มไว้แล้ว แต่กันไว้เผื่อกรณีเลี่ยงผ่านโค้ด
    const isAlreadyInDB = modalData.currentAssignments.some(
      a => (a.templateType || a.assignmentType) === type
    );
    if (isAlreadyInDB) return;

    if (isSpecialInput && modalData.hasExistingNormal) return;
    if (!isSpecialInput && modalData.hasExistingSpecial) return;

    setSelectedTypes(prev => {
      // 🚩 2. Toggle Logic: ถ้ากดซ้ำที่ปุ่มเดิม ให้เอาออก (ขอบหาย)
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      
      // 🚩 3. การเลือกใหม่ (Handle Exclusive Logic)
      if (isSpecialInput) {
        // ถ้าเลือก "พิเศษ" (ลา/หยุด/E) -> ให้ล้างค่าอื่นๆ ทั้งหมดที่กำลังเลือกอยู่
        // เพราะปกติพิเศษมักจะอยู่เดี่ยวๆ ใน 1 วัน
        return [type];
      } else {
        // ถ้าเลือก "เวรปกติ" (เช้า/บ่าย/ดึก) -> ให้ล้าง "พิเศษ" ออก 
        // แต่สามารถสะสมเวรปกติร่วมกันได้ (เช่น ควงเวร เช้า+บ่าย)
        const onlyNormals = prev.filter(t => !['emergency', 'leave', 'off'].includes(t));
        return [...onlyNormals, type];
      }
    });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteShiftAssignment(deleteTarget.id);
      setDeleteTarget(null); 
      refreshData();
      // ไม่ต้องสั่งปิด Modal ทันทีก็ได้ เพื่อให้ user เห็นผลลัพธ์ว่ารายการหายไปแล้ว
      // แต่ถ้าอยากให้ลื่นไหลแบบเดิมก็คงไว้ครับ
      close(); 
    } catch (err: any) {
      alert(err.message || "ลบไม่สำเร็จ");
    } finally {
      setIsDeleting(false);
    }
  };

  const close = () => {
    setSelectedCell(null);
    setSelectedTypes([]);
    setDeleteTarget(null);
  };

  return {
    isOpen: !!selectedCell,
    ...modalData,
    selectedTypes,
    handleSelectType,
    setSelectedTypes,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    executeDelete,
    open,
    close
  };
}