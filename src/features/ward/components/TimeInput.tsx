'use client'

import React from 'react'

interface TimeInputProps {
  label: string
  h: string
  m: string
  setH: (v: string) => void
  setM: (v: string) => void
  disabled: boolean 
  hasError?: boolean
}

export function TimeInput({ label, h, m, setH, setM, disabled, hasError }: TimeInputProps) {
  
  const handleChange = (val: string, setter: (v: string) => void, max: number) => {
    if (disabled) return;

    const numOnly = val.replace(/\D/g, ''); 
    
    if (numOnly === '') {
      setter(''); 
      return;
    }

    // Logic: ถ้าพิมพ์เลขที่เกินหลักสิบของค่า Max (เช่น พิมพ์ 3 ในช่องชั่วโมง ซึ่ง Max คือ 23)
    // ให้เติม 0 ข้างหน้าทันที เป็น 03
    const firstDigitMax = Math.floor(max / 10);
    if (numOnly.length === 1 && parseInt(numOnly) > firstDigitMax) {
      setter(`0${numOnly}`);
    } else {
      setter(numOnly.slice(0, 2)); 
    }
  }

  const handleFocus = (val: string, setter: (v: string) => void) => {
    if (disabled) return;
    // เคลียร์ค่าว่างเมื่อจะพิมพ์ใหม่
    if (val === '--') {
      setter('') 
    }
  }

  const formatBlur = (val: string, setter: (v: string) => void, max: number) => {
    if (disabled) return;
    if (!val || val === '') { 
      setter('--'); 
      return; 
    }
    // ตรวจสอบให้อยู่ในขอบเขต 0 - Max
    let num = Math.min(Math.max(parseInt(val) || 0, 0), max)
    setter(num.toString().padStart(2, '0'))
  }

  return (
    <div className="flex-1">
      {/* Label: ปรับสีให้อ่อนลงเมื่อแก้ไขไม่ได้ */}
      <label className={`block text-[10px] font-bold mb-1 uppercase tracking-tight transition-colors 
        ${disabled ? 'text-slate-300' : 'text-slate-400'}`}>
        {label}
      </label>
      
      {/* กล่อง Input Container */}
      <div className={`
        flex items-center border-2 rounded-2xl px-2 py-1.5 transition-all
        ${disabled 
          ? 'bg-slate-50 border-slate-100' // ✅ เทาอ่อนๆ เมื่อ Lock (ดูสะอาดกว่า bg-slate-100)
          : hasError 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-slate-200 focus-within:border-blue-400 shadow-sm'}
      `}>
        {/* Hour Input */}
        <input
          type="text" 
          inputMode="numeric"
          className={`w-full text-center font-bold bg-transparent outline-none transition-colors text-base
            ${disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}
          `}
          value={h} 
          onChange={e => handleChange(e.target.value, setH, 23)}
          onFocus={() => handleFocus(h, setH)} 
          onBlur={() => formatBlur(h, setH, 23)} 
          disabled={disabled} 
          placeholder="--"
        />
        
        {/* Colon : */}
        <span className={`mx-0.5 font-bold transition-colors 
          ${disabled || (h === '--' && m === '--') ? 'text-slate-200' : 'text-slate-400'}`}>
          :
        </span>
        
        {/* Minute Input */}
        <input
          type="text" 
          inputMode="numeric"
          className={`w-full text-center font-bold bg-transparent outline-none transition-colors text-base
            ${disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}
          `}
          value={m} 
          onChange={e => handleChange(e.target.value, setM, 59)}
          onFocus={() => handleFocus(m, setM)} 
          onBlur={() => formatBlur(m, setM, 59)} 
          disabled={disabled} 
          placeholder="--"
        />
      </div>
    </div>
  )
}