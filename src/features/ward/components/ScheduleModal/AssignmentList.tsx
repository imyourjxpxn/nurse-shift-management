//ทำหน้าที่รวมการแสดงผลเวร "ที่มีอยู่แล้ว" และ "ที่กำลังเลือกสะสม" (Pending) ไว้ด้วยกัน


'use client'

import React from 'react';
import { MinusCircle } from 'lucide-react';
import { ShiftCellData } from '@/features/ward/types'; 

interface Props {
  current: ShiftCellData[];
  // pending: any[]; // 🚩 เอาออกตามบรีฟ (ไม่ต้องแสดง Tag กระพริบแล้ว)
  onDelete: (target: { id: string, name: string }) => void;
  getLabel: (type: string) => string;
}

export const AssignmentList = ({ current, onDelete, getLabel }: Props) => {
  // ถ้าไม่มีข้อมูลใน Database เลย ก็ไม่ต้องแสดงส่วนนี้
  if (current.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* แสดงเฉพาะรายการที่บันทึกแล้วใน Database เท่านั้น */}
      <div className="animate-in fade-in slide-in-from-top-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left px-1">
          บันทึกในระบบแล้ว
        </p>
        <div className="flex flex-wrap gap-2">
          {current.map((a) => {
            const label = getLabel(a.templateType || a.assignmentType);
            return (
              <div 
                key={a.shiftAssignmentId} 
                className="flex items-center px-3 py-1.5 rounded-xl border border-sky-100 bg-sky-50 text-sky-700 font-bold text-xs shadow-sm group"
              >
                {label}
                <button 
                  onClick={() => onDelete({ id: a.shiftAssignmentId, name: label })} 
                  className="ml-2 text-rose-400 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all"
                  title="ลบออกจากระบบ"
                >
                  <MinusCircle size={16} fill="white" />
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-slate-400 mt-2 px-1">
          * รายการข้างต้นบันทึกลงฐานข้อมูลแล้ว การลบจะมีผลทันที
        </p>
      </div>
    </div>
  );
};