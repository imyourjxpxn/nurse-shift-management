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

  // Logic Block ปุ่ม (ทำตามเดิมของคุณ)
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[440px] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header (เหมือนเดิม) */}
        <div className="p-8 pb-4 flex justify-between items-start border-b border-slate-50">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800">จัดการเวร</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-blue-600 font-extrabold text-xl">{nurseName}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-bold text-base">{dateLabel}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Content Area (ใส่ blur เมื่อจะลบ) */}
        <div className={`px-8 py-6 flex-1 overflow-y-auto max-h-[60vh] transition-all duration-300 ${deleteTarget ? 'blur-md pointer-events-none' : ''}`}>
          <AssignmentList 
            current={currentAssignments} 
            onDelete={setDeleteTarget} 
            getLabel={getLabel} 
          />

          {/* ปุ่มเลือกเวรปกติ (ช บ ด) */}
          <div className="mb-8 mt-4 text-left">
            <p className="text-[11px] font-black text-slate-400 uppercase mb-3 px-1">เพิ่มเวรทำงาน</p>
            <div className="grid gap-2">
              {['morning', 'afternoon', 'night'].map((type) => {
                const template = shiftTemplates.find(t => t.type === type);
                return (
                  <ShiftOption 
                    key={type}
                    type={type}
                    label={getLabel(type)} 
                    timeRange={`${template?.startTime || '--:--'} - ${template?.endTime || '--:--'}`}
                    isSelected={selectedTypes.includes(type)}
                    isBlocked={getBlockStatus(type)}
                    onClick={() => onSelectType(type)}
                  />
                );
              })}
            </div>
          </div>

          {/* ปุ่มเลือกกรณีพิเศษ (E ลา OFF) */}
          <div className="text-left">
            <p className="text-[11px] font-black text-slate-400 uppercase mb-3 px-1">กรณีพิเศษ</p>
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

        {/* Footer Buttons */}
        <div className={`p-8 bg-white flex gap-3 border-t border-slate-50 transition-opacity ${deleteTarget ? 'opacity-0' : 'opacity-100'}`}>
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-3xl font-bold hover:bg-slate-200">
            ยกเลิก
          </button>
          <button onClick={() => onConfirm(selectedTypes)} className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
            ยืนยัน
          </button>
        </div>

        {/* Delete Confirmation Overlay (ตัวทับเพื่อยืนยันลบ) */}
        {deleteTarget && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center w-full max-w-[320px]">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">ยืนยันการลบ?</h3>
              <p className="text-slate-500 text-sm mt-2">"{deleteTarget.name}" จะถูกลบถาวร</p>
              
              <div className="flex gap-3 mt-8">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">
                  ยกเลิก
                </button>
                <button 
                  disabled={isDeleting} 
                  onClick={onExecuteDelete} 
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-100 disabled:opacity-50"
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