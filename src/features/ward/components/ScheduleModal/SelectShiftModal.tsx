'use client'

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AssignmentList } from './AssignmentList';
import { ShiftOption } from './ShiftOptionButton';
import { SpecialOption } from './SpecialOptionButton';
import { ShiftCellData, ShiftTemplate } from '@/features/ward/types';

const SHIFT_LABELS: Record<string, string> = {
  morning: 'เวรเช้า',
  afternoon: 'เวรบ่าย',
  night: 'เวรดึก',
  emergency: 'เวร E',
  leave: 'วันลา',
  off: 'วันหยุด (OFF)'
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurseName: string;
  dateLabel: string;
  userId: string;
  day: number;
  currentAssignments: ShiftCellData[];
  shiftTemplates: ShiftTemplate[];
  selectedTypes: string[];
  onSelectType: (type: string) => void;
  onConfirm: (selectedTypes: string[]) => void;
  deleteTarget: { id: string, name: string } | null;
  setDeleteTarget: (target: { id: string, name: string } | null) => void;
  isDeleting: boolean;
  onExecuteDelete: () => Promise<void>;
}

export function SelectShiftModal({
  isOpen, onClose, nurseName, dateLabel,
  currentAssignments, shiftTemplates, selectedTypes, onSelectType, 
  deleteTarget, setDeleteTarget, isDeleting, 
  onExecuteDelete, onConfirm
}: ModalProps) {
  
  if (!isOpen) return null;

  const getLabel = (type: string) => SHIFT_LABELS[type] || type;

  // --- 🛡️ VALIDATION LOGIC ---
  const hasSavedNormal = currentAssignments.some(a => 
    ['morning', 'afternoon', 'night'].includes(a.templateType || a.assignmentType)
  );
  const hasSavedSpecial = currentAssignments.some(a => 
    ['emergency', 'leave', 'off'].includes(a.templateType || a.assignmentType)
  );

  const getBlockStatus = (type: string) => {
    const isSpecialInput = ['emergency', 'leave', 'off'].includes(type);
    const isAlreadySaved = currentAssignments.some(a => 
      (a.templateType || a.assignmentType) === type
    );
    
    if (isAlreadySaved) return true;
    if (isSpecialInput && hasSavedNormal) return true;
    if (!isSpecialInput && hasSavedSpecial) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-slate-900 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[440px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* 1. Header */}
        <div className="p-8 pb-4 flex justify-between items-start border-b border-slate-50">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">จัดการเวร</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-blue-600 font-extrabold text-xl">{nurseName}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-bold text-base">{dateLabel}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 2. Content Area */}
        <div className={`px-8 py-6 flex-1 overflow-y-auto max-h-[60vh] ${deleteTarget ? 'blur-md pointer-events-none' : ''}`}>
          
          {/* List ของเวรที่บันทึกแล้ว */}
          <AssignmentList 
            current={currentAssignments} 
            onDelete={setDeleteTarget} 
            getLabel={getLabel} 
          />

          {/* ส่วนเลือกเวรปกติ */}
          <div className="mb-8 mt-4 text-left">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">เพิ่มเวรทำงาน</p>
            <div className="grid gap-2">
              {['morning', 'afternoon', 'night'].map((type) => {
                const template = shiftTemplates.find(t => t.type === type);
                return (
                  <ShiftOption 
                    key={type}
                    type={type}
                    label={getLabel(type)} 
                    timeRange={`${template?.startTime || '00:00'} - ${template?.endTime || '00:00'}`}
                    isSelected={selectedTypes.includes(type)}
                    isBlocked={getBlockStatus(type)}
                    onClick={() => onSelectType(type)}
                  />
                );
              })}
            </div>
          </div>

          {/* ส่วนเลือกกรณีพิเศษ */}
          <div className="text-left">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">กรณีพิเศษ</p>
            <div className="grid grid-cols-3 gap-2">
              {['emergency', 'leave', 'off'].map((type) => (
                <SpecialOption 
                  key={type} 
                  label={getLabel(type)}
                  isSelected={selectedTypes.includes(type)}
                  isBlocked={getBlockStatus(type)}
                  onClick={() => onSelectType(type)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Footer Buttons */}
        <div className={`p-8 bg-white flex gap-3 border-t border-slate-50 ${deleteTarget ? 'hidden' : ''}`}>
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-3xl font-bold text-base hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          
          <button 
            onClick={() => onConfirm(selectedTypes)} 
            className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-black text-base shadow-xl shadow-blue-100 active:scale-95 transition-all"
          >
            ยืนยัน
          </button>
        </div>

        {/* 4. Delete Confirmation Overlay (อยู่ด้านบนสุดของ Modal) */}
        {deleteTarget && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in">
            <div className="text-center w-full max-w-[340px]">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">ยืนยันการลบ?</h3>
              <p className="text-slate-500 text-sm mt-2">"{deleteTarget.name}" จะถูกลบจากระบบ</p>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setDeleteTarget(null)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-base hover:bg-slate-200 active:scale-95 transition-all"
                >
                  ยกเลิก
                </button>
                
                <button 
                  disabled={isDeleting} 
                  onClick={onExecuteDelete} 
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-base shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div> 
  );
}