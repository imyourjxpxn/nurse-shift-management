//ปุ่มเลือกกรณีพิเศษ (E, Leave, Off)

'use client'

import React from 'react';

interface SpecialOptionProps {
  label: string;
  isSelected: boolean;
  isBlocked: boolean;
  onClick: () => void;
}

export const SpecialOption = ({ 
  label, 
  isSelected, 
  isBlocked, 
  onClick 
}: SpecialOptionProps) => (
  <button
    type="button"
    disabled={isBlocked}
    onClick={onClick}
    className={`py-3.5 rounded-xl border-2 transition-all font-black text-xs w-full
      ${isBlocked 
        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' 
        : isSelected 
          ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' 
          : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200 active:scale-95'
      }`}
  >
    {label}
  </button>
);