//ปุ่มเลือกเวร (Morning, Afternoon, Night) ที่มี Logic การ Disable ในตัว

'use client'

import React from 'react';

interface ShiftOptionProps {
  type: string;
  label: string;
  timeRange: string;
  isSelected: boolean;
  isBlocked: boolean;
  onClick: () => void;
}

export const ShiftOption = ({ 
  label, 
  timeRange, 
  isSelected, 
  isBlocked, 
  onClick 
}: ShiftOptionProps) => (
  <button
    type="button"
    disabled={isBlocked}
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all w-full
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
        : 'border-slate-50 bg-slate-50'
      }
      ${isBlocked 
        ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 border-slate-200' 
        : 'hover:border-slate-200 active:scale-[0.98]'
      }`}
  >
    <div className="flex flex-col items-start text-left">
      <span className={`text-base font-black transition-colors
        ${isBlocked ? 'text-slate-400' : isSelected ? 'text-blue-700' : 'text-slate-700'}
      `}>
        {label}
      </span>
      
      {/* สถานะกำกับปุ่ม */}
      {isSelected && !isBlocked && (
        <span className="text-[10px] text-blue-500 font-bold animate-in fade-in duration-300">
          กำลังเลือก...
        </span>
      )}
      {isBlocked && (
        <span className="text-[10px] text-slate-400 font-bold">
          บันทึกในระบบแล้ว
        </span>
      )}
    </div>

    <span className={`text-sm font-bold transition-colors
      ${isBlocked ? 'text-slate-300' : 'text-slate-400'}
    `}>
      {timeRange}
    </span>
  </button>
);