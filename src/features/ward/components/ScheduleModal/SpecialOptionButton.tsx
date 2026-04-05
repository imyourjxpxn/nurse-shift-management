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
    className={`py-2 rounded-lg border text-xs font-semibold transition-all
    ${isBlocked 
      ? 'bg-slate-100 text-slate-300' 
      : isSelected 
        ? 'bg-sky-500 text-white border-sky-400' 
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    }`}
  >
    {label}
  </button>
);