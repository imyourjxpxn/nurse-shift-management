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
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">

              {/* Header */}
              <div className="px-6 py-4 flex justify-between items-center border-b">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">จัดการเวร</h2>
                  <p className="text-sm text-slate-500">
                    {nurseName} • {dateLabel}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className={`px-6 py-4 flex-1 overflow-y-auto max-h-[50vh] 
                ${deleteTarget ? 'blur-sm pointer-events-none' : ''}`}>

                <AssignmentList 
                  current={currentAssignments} 
                  onDelete={setDeleteTarget} 
                  getLabel={getLabel} 
                />

                {/* Normal Shift */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    เพิ่มเวรทำงาน
                  </p>

                  <div className="space-y-2">
                    {['morning', 'afternoon', 'night'].map((type) => {
                      const template = shiftTemplates.find(t => t.type === type)

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
                      )
                    })}
                  </div>
                </div>

                {/* Special */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    กรณีพิเศษ
                  </p>

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

              {/* Footer */}
              <div className={`px-6 py-4 border-t flex gap-3 
                ${deleteTarget ? 'opacity-0' : ''}`}>

                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={() => onConfirm(selectedTypes)}
                  className="flex-1 py-2.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
                >
                  ยืนยัน
                </button>
              </div>

                        {deleteTarget && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={28} />
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                      ยืนยันการลบ
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      "{deleteTarget.name}" จะถูกลบ
                    </p>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setDeleteTarget(null)}
                        className="flex-1 py-2.5 rounded-lg border text-slate-600 hover:bg-slate-100"
                      >
                        ยกเลิก
                      </button>

                      <button
                        disabled={isDeleting}
                        onClick={onExecuteDelete}
                        className="flex-1 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
       </div>
</div>
  );
}