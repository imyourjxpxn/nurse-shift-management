'use client'

import React from 'react'
import { ShiftSyncData, ShiftTemplate } from '@/features/ward/types'
import { ShiftCard } from './ShiftCard'

interface ShiftConfigPanelProps {
  isEditable: boolean
  templates: ShiftTemplate[]
  onDataSync: (type: string, data: ShiftSyncData) => void
}

export function ShiftConfigPanel({ isEditable, templates, onDataSync }: ShiftConfigPanelProps) {
  
 
  const getShiftInfo = (type: string) => {
    // หา Template ที่มี type ตรงกัน (Case-insensitive)
    const template = templates.find(t => t.type.toLowerCase() === type.toLowerCase());
    
    /**
     * LOGIC: 
     * 1. ถ้ามี shiftTemplateId แล้ว = "เวลา (Start/End)" จะถูกล็อกห้ามแก้
     * 2. แต่ "จำนวนคน (Required People)" จะไม่ล็อก (ถ้าเป็น Head Nurse) 
     * เพื่อให้ยิง POST createShiftRequirement ชุดใหม่ได้เสมอ
     */
    const isTimeLocked = !!template?.shiftTemplateId;

    return {
      template,
      isTimeLocked
    };
  }

  //  ฟังก์ชันช่วย Sync ที่จะบังคับให้ส่ง ID กลับไปด้วยเสมอ
  const handleInternalSync = (type: string, incomingData: ShiftSyncData, existingTemplate?: ShiftTemplate) => {
    onDataSync(type, {
      ...incomingData,
      // 1. แนบ ID กลับไปเหมือนเดิม
    shiftTemplateId: existingTemplate?.shiftTemplateId,
    
    // 2. ✅ เพิ่มการส่งค่าดั้งเดิมจาก DB ไปด้วย
    // เพื่อให้ useSaveConfig สามารถใช้เทียบได้ว่า "ค่าเปลี่ยนไปจากเดิมไหม"
    originalRequiredPeople: existingTemplate?.requiredPeople
    });
  };

  const morningInfo = getShiftInfo('morning');
  const afternoonInfo = getShiftInfo('afternoon');
  const nightInfo = getShiftInfo('night');

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* --- เวรเช้า --- */}
      <ShiftCard 
        title="เวรเช้า (ช)" 
        bg="bg-sky-50" 
        border="border-sky-100" 
        isEditable={isEditable} 
        data={morningInfo.template}
        // 🔒 ส่งไปบอกลูกว่าให้ล็อคเฉพาะช่อง "เวลา" หรือไม่
        isTimeLocked={morningInfo.isTimeLocked}
        defaultStart="--:--" 
        defaultEnd="--:--" 
        onSync={(data) => handleInternalSync('morning', data, morningInfo.template)}
      />

      {/* --- เวรบ่าย --- */}
      <ShiftCard 
        title="เวรบ่าย (บ)" 
        bg="bg-orange-50" 
        border="border-orange-50" 
        isEditable={isEditable} 
        data={afternoonInfo.template}
        isTimeLocked={afternoonInfo.isTimeLocked}
        defaultStart="--:--" 
        defaultEnd="--:--" 
        onSync={(data) => handleInternalSync('afternoon', data, afternoonInfo.template)}
      />

      {/* --- เวรดึก --- */}
      <ShiftCard 
        title="เวรดึก (ด)" 
        bg="bg-violet-50" 
        border="border-violet-100" 
        isEditable={isEditable} 
        data={nightInfo.template}
        isTimeLocked={nightInfo.isTimeLocked}
        defaultStart="--:--" 
        defaultEnd="--:--" 
        onSync={(data) => handleInternalSync('night', data, nightInfo.template)}
      />
    </div>
  )
}