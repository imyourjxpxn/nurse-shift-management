'use client'

import { useState, useMemo, useCallback, useEffect } from 'react';
import { deleteShiftAssignment } from '../api/deleteShiftAssign';
import { NurseScheduleRow, ShiftCellData } from '@/features/ward/types'; 

export function useScheduleModal(
  scheduleRows: Record<string, NurseScheduleRow>, 
  refreshData: () => void,
  pendingAssignments: any[]
) {
  const [selectedCell, setSelectedCell] = useState<{ userId: string; day: number } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // คำนวณข้อมูลที่จะโชว์ใน Modal
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

  // Sync ค่าที่ User เคยเลือกไว้ (แต่ยังไม่ได้บันทึกลง DB) เมื่อเปิด Modal
  useEffect(() => {
    if (selectedCell) {
      const { userId, day } = selectedCell;
      const existingPending = pendingAssignments
        .filter(p => p.userId === userId && p.day === (day + 1))
        .map(p => p.templateType || p.assignmentType);
      setSelectedTypes(existingPending);
    }
  }, [selectedCell, pendingAssignments]);

  const open = useCallback((userId: string, day: number) => {
    setSelectedCell({ userId, day });
  }, []);

  // ปิด Modal และล้างค่าชั่วคราวทั้งหมด
  const close = useCallback(() => {
    setSelectedCell(null);
    setSelectedTypes([]);
    setDeleteTarget(null);
  }, []);

  // Logic การเลือกเวรแบบ Toggle และ Exclusive (ควงเวรได้ / พิเศษต้องอยู่เดี่ยว)
  const handleSelectType = (type: string) => {
    const isSpecialInput = ['emergency', 'leave', 'off'].includes(type);
    
    const isAlreadyInDB = modalData.currentAssignments.some(
      a => (a.templateType || a.assignmentType) === type
    );
    
    if (isAlreadyInDB) return;
    if (isSpecialInput && modalData.hasExistingNormal) return;
    if (!isSpecialInput && modalData.hasExistingSpecial) return;

    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      
      if (isSpecialInput) {
        return [type];
      } else {
        const normalsOnly = prev.filter(t => !['emergency', 'leave', 'off'].includes(t));
        return [...normalsOnly, type];
      }
    });
  };

  // 🚩 แก้ไข: ฟังก์ชันลบข้อมูล และปิด Modal เมื่อสำเร็จ
  const executeDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteShiftAssignment(deleteTarget.id);
      
      // ล้างเป้าหมายการลบก่อน
      setDeleteTarget(null); 
      
      // สั่งให้หน้าหลักโหลดข้อมูลใหม่ (Table Refresh)
      refreshData(); 
      
      // ✅ ปิด Modal ทันทีหลังจากลบสำเร็จตามที่คุณต้องการ
      // ใช้ setTimeout เล็กน้อย (100ms) เพื่อให้ UI ดูไม่กระชากจนเกินไป
      setTimeout(() => {
        close();
      }, 100);

    } catch (err: any) {
      console.error("🔴 Delete failed:", err);
      alert(err.message || "ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
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