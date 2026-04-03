'use client'

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AssignmentList } from '@/features/ward/components/ScheduleModal/AssignmentList';
import { ShiftOption } from '@/features/ward/components/ScheduleModal/ShiftOptionButton';
import { SpecialOption } from '@/features/ward/components/ScheduleModal/SpecialOptionButton';
import { ShiftCellData, ShiftTemplate } from '@/features/ward/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurseName: string;
  dateLabel: string;
  currentAssignments: ShiftCellData[];
  shiftTemplates: ShiftTemplate[];
  selectedTypes: string[];
  onSelectType: (type: string) => void;
  onClearSelection: () => void;
  deleteTarget: { id: string, name: string } | null;
  setDeleteTarget: (target: { id: string, name: string } | null) => void;
  isDeleting: boolean;
  onExecuteDelete: () => Promise<void>;
  onConfirm: (selectedTypes: string[]) => void;
  pendingAssignments: any[];
}

export function SelectShiftModal({
  isOpen, onClose, nurseName, dateLabel, currentAssignments, shiftTemplates,
  selectedTypes, onSelectType, onClearSelection, deleteTarget, setDeleteTarget,
  isDeleting, onExecuteDelete, onConfirm, pendingAssignments = []
}: ModalProps) {
  
  if (!isOpen) return null;

  const getTemplate = (type: string) => shiftTemplates.find((t) => t.type === type);
  const getLabel = (type: string) => {
    const map: Record<string, string> = { 
      morning: 'เช้า', afternoon: 'บ่าย', night: 'ดึก', 
      emergency: 'ด่วน (E)', leave: 'ลา', off: 'วันหยุด (OFF)' 
    };
    return map[type] || type;
  };

  const pendingHere = pendingAssignments.filter(
    (p: any) => p.nurseName === nurseName && p.dateLabel === dateLabel
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 text-slate-900 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[440px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* Header */}
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

        {/* Content */}
        <div className={`px-8 py-6 flex-1 overflow-y-auto max-h-[60vh] ${deleteTarget ? 'blur-md pointer-events-none' : ''}`}>
          
          <AssignmentList 
            current={currentAssignments} 
            pending={pendingHere} 
            onDelete={setDeleteTarget} 
            getLabel={getLabel} 
          />

          {/* 🚩 Section: เพิ่มเวรทำงาน (ไม่มี isBlocked แล้ว) */}
          <div className="mb-8 mt-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">เพิ่มเวรทำงาน</p>
            <div className="grid gap-2">
              {['morning', 'afternoon', 'night'].map((type) => {
                const template = getTemplate(type);
                return (
                  <ShiftOption 
                    key={type}
                    type={type}
                    label={getLabel(type)} 
                    timeRange={`${template?.startTime || '00:00'} - ${template?.endTime || '00:00'}`}
                    isSelected={selectedTypes.includes(type)}
                    isBlocked={false} // 🚩 ปล่อยให้ Backend จัดการ
                    onClick={() => onSelectType(type)}
                  />
                );
              })}
            </div>
          </div>

          {/* 🚩 Section: กรณีพิเศษ (ไม่มี isBlocked แล้ว) */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">กรณีพิเศษ</p>
            <div className="grid grid-cols-3 gap-2">
              {['emergency', 'leave', 'off'].map((type) => (
                <SpecialOption 
                  key={type} 
                  label={getLabel(type)}
                  isSelected={selectedTypes.includes(type)}
                  isBlocked={false} // 🚩 ปล่อยให้ Backend จัดการ
                  onClick={() => onSelectType(type)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 bg-white flex gap-3 border-t border-slate-50 ${deleteTarget ? 'hidden' : ''}`}>
          <button onClick={onClearSelection} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-3xl font-bold text-base">
            ล้างค่า
          </button>
          <button 
            disabled={selectedTypes.length === 0} 
            onClick={() => onConfirm(selectedTypes)} 
            className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-black text-base shadow-xl shadow-blue-100"
          >
            ยืนยันบันทึก
          </button>
        </div>

        {/* Delete Confirmation */}
        {deleteTarget && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in">
            <div className="text-center w-full max-w-[300px]">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">ยืนยันการลบ?</h3>
              <p className="text-slate-500 text-sm mt-2">"{deleteTarget.name}" จะถูกลบออก</p>
              <div className="flex flex-col gap-2 mt-8">
                <button disabled={isDeleting} onClick={onExecuteDelete} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-base shadow-lg shadow-rose-100">
                  {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบรายการ'}
                </button>
                <button onClick={() => setDeleteTarget(null)} className="w-full py-4 text-slate-400 font-bold">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}