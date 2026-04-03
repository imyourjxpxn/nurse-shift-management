'use client'

import { useState, useMemo } from 'react';
import { deleteShiftAssignment } from '../api/deleteShiftAssign';
import { 
  NurseScheduleRow, 
  ShiftCellData, 
  AssignmentType 
} from '@/features/ward/types'; // ปรับ path ให้ตรงกับโปรเจกต์คุณ

export function useScheduleModal(
  scheduleRows: Record<string, NurseScheduleRow>, 
  refreshData: () => void
) {
  // 1. State สำหรับเก็บว่ากำลังคลิกที่ Cell ไหน
  const [selectedCell, setSelectedCell] = useState<{ userId: string; day: number } | null>(null);
  
  // 2. State สำหรับเก็บเวรที่ User กำลังเลือกเพิ่มใน Modal
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // 3. State สำหรับจัดการการลบเวร
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🚩 คำนวณข้อมูลที่จะส่งให้ Modal
  const modalData = useMemo(() => {
    if (!selectedCell || !scheduleRows[selectedCell.userId]) {
      return { 
        userId: "", 
        nurseName: "", 
        currentAssignments: [], 
        day: 0, 
        hasExistingNormal: false, 
        hasExistingSpecial: false 
      };
    }

    const nurse = scheduleRows[selectedCell.userId];
    // ดึง Array ของเวรในวันนั้น (โครงสร้าง [เช้า, บ่าย, ดึก] หรือ [Special])
    const dayShiftsRaw = nurse.dailyShifts[selectedCell.day] || [];

    // กรองเอาเฉพาะอันที่ไม่ใช่ null
    const assignments: ShiftCellData[] = dayShiftsRaw.filter((s): s is ShiftCellData => s !== null);

    // ✅ เช็คว่ามีเวรปกติ (SHIFT) อยู่แล้วหรือไม่
    const hasExistingNormal = assignments.some(a => a.assignmentType === AssignmentType.SHIFT);
    
    // ✅ เช็คว่ามีรายการพิเศษ (E/Off/Leave) อยู่แล้วหรือไม่
    const hasExistingSpecial = assignments.some(a => 
      [AssignmentType.EMERGENCY, AssignmentType.LEAVE, AssignmentType.OFF].includes(a.assignmentType)
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

  // 🚩 Function จัดการการคลิกเลือกประเภทเวร
  const handleSelectType = (type: string) => {
    // ตรวจสอบว่าเป็นกลุ่มพิเศษหรือไม่
    const isSpecialInput = ['emergency', 'leave', 'off'].includes(type);
    
    // 🚫 กฎ: ถ้าในช่องนั้นมีเวรปกติอยู่แล้ว ห้ามกดเลือกประเภทพิเศษเพิ่ม
    if (isSpecialInput && modalData.hasExistingNormal) {
      alert("ไม่สามารถเลือกสถานะพิเศษได้ เนื่องจากมีเวรปกติอยู่ในวันนี้แล้ว");
      return;
    }
    // 🚫 กฎ: ถ้ามีสถานะพิเศษ (เช่น OFF) อยู่แล้ว ห้ามกดเลือกเวรปกติเพิ่ม
    if (!isSpecialInput && modalData.hasExistingSpecial) {
      alert("ไม่สามารถเลือกเวรปกติได้ เนื่องจากมีสถานะพิเศษอยู่ในวันนี้แล้ว");
      return;
    }

    setSelectedTypes(prev => {
      // กรณีเลือกพิเศษ (Off/Leave/E): ให้เลือกได้แค่อย่างเดียว
      if (isSpecialInput) {
        return prev.includes(type) ? [] : [type];
      }
      
      // กรณีเลือกเวรปกติ (เช้า/บ่าย/ดึก): กรองเอาพวกพิเศษออกก่อน (ป้องกัน User กดค้างไว้)
      const filtered = prev.filter(t => !['emergency', 'leave', 'off'].includes(t));
      return filtered.includes(type) 
        ? filtered.filter(t => t !== type) 
        : [...filtered, type];
    });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteShiftAssignment(deleteTarget.id);
      setDeleteTarget(null); 
      refreshData(); // โหลดตารางใหม่
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
    open: (userId: string, day: number) => setSelectedCell({ userId, day }),
    close
  };
}