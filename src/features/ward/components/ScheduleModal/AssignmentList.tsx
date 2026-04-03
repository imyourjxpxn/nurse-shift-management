//ทำหน้าที่รวมการแสดงผลเวร "ที่มีอยู่แล้ว" และ "ที่กำลังเลือกสะสม" (Pending) ไว้ด้วยกัน

import React from 'react';
import { MinusCircle } from 'lucide-react';
import { ShiftCellData } from '@/features/ward/types'; 

interface Props {
  current: ShiftCellData[];
  pending: any[]; // ตรงนี้เป็น any ได้เพราะเป็นข้อมูลชั่วคราวจาก Client
  onDelete: (target: { id: string, name: string }) => void;
  getLabel: (type: string) => string;
}

export const AssignmentList = ({ current, pending, onDelete, getLabel }: Props) => {
  if (current.length === 0 && pending.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* 1. บันทึกแล้วใน Database */}
      {current.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">
            บันทึกแล้ว
          </p>
          <div className="flex flex-wrap gap-2">
            {current.map((a) => {
              const label = getLabel(a.templateType || a.assignmentType);
              return (
                <div 
                  key={a.shiftAssignmentId} 
                  className="flex items-center px-3 py-1.5 rounded-xl border bg-slate-50 text-slate-600 font-bold text-xs shadow-sm"
                >
                  {label}
                  <button 
                    onClick={() => onDelete({ id: a.shiftAssignmentId, name: label })} 
                    className="ml-2 text-rose-500 hover:scale-110 active:scale-95 transition-all"
                  >
                    <MinusCircle size={16} fill="white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 2. เลือกสะสมไว้ (Pending) */}
      {pending.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 text-left">
            กำลังเลือก...
          </p>
          <div className="flex flex-wrap gap-2">
            {pending.map((p, idx) => (
              <div 
                key={idx} 
                className="flex items-center px-3 py-1.5 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 font-bold text-xs"
              >
                {getLabel(p.templateType || p.assignmentType)}
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};