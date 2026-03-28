'use client'

import React, { useEffect, useState } from 'react'
import { ShiftTemplate } from '@/features/ward/types'

interface ShiftConfigPanelProps {
  isEditable: boolean
  templates: ShiftTemplate[]
}

export function ShiftConfigPanel({ isEditable, templates }: ShiftConfigPanelProps) {
  const getShiftByType = (type: string) => 
    templates.find(t => t.type.toLowerCase() === type.toLowerCase())

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <ShiftCard 
        title="เวรเช้า (ช)" bg="bg-sky-50" border="border-sky-100" 
        isEditable={isEditable} data={getShiftByType('morning')} 
        defaultStart="--:--" defaultEnd="--:--" 
      />
      <ShiftCard 
        title="เวรบ่าย (บ)" bg="bg-orange-50" border="border-orange-50" 
        isEditable={isEditable} data={getShiftByType('afternoon')} 
        defaultStart="--:--" defaultEnd="--:--" 
      />
      <ShiftCard 
        title="เวรดึก (ด)" bg="bg-violet-50" border="border-violet-100" 
        isEditable={isEditable} data={getShiftByType('night')} 
        defaultStart="--:--" defaultEnd="--:--" 
      />
    </div>
  )
}

function ShiftCard({ title, bg, border, isEditable, data, defaultStart, defaultEnd }: any) {
  const [required, setRequired] = useState('')
  const [startH, setStartH] = useState('00'); const [startM, setStartM] = useState('00')
  const [endH, setEndH] = useState('00'); const [endM, setEndM] = useState('00')
  const [error, setError] = useState('')

  const validateGap = (sh: string, sm: string, eh: string, em: string) => {
    const startTotal = parseInt(sh) * 60 + parseInt(sm)
    let endTotal = parseInt(eh) * 60 + parseInt(em)
    if (endTotal <= startTotal) endTotal += 24 * 60 
    const diff = endTotal - startTotal
    if (diff > 480) {
      setError('ระยะเวลาเวรห้ามเกิน 8 ชม.')
    } else {
      setError('')
    }
  }

  useEffect(() => {
    const parseTime = (time: string) => {
      const parts = (time || "00:00").split(':')
      return { h: parts[0].padStart(2, '0'), m: parts[1]?.padStart(2, '0') || '00' }
    }

    if (data) {
      setRequired(data.requiredPeople?.toString() || '')
      const s = parseTime(data.startTime || defaultStart)
      const e = parseTime(data.endTime || defaultEnd)
      setStartH(s.h); setStartM(s.m); setEndH(e.h); setEndM(e.m)
    } else {
      const s = parseTime(defaultStart); const e = parseTime(defaultEnd)
      setRequired(''); setStartH(s.h); setStartM(s.m); setEndH(e.h); setEndM(e.m)
    }
  }, [data, defaultStart, defaultEnd])

  useEffect(() => {
    validateGap(startH, startM, endH, endM)
  }, [startH, startM, endH, endM])

  return (
    <div className={`${bg} ${border} border-2 rounded-3xl p-6 shadow-sm relative transition-all min-h-[220px] ${error ? 'border-red-300' : ''}`}>
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold mb-1.5 text-slate-400 uppercase tracking-tight">จำนวนพยาบาล</label>
          <input
            type="text" value={required}
            onChange={(e) => setRequired(e.target.value.replace(/\D/g, ''))}
            placeholder="ระบุจำนวนพยาบาล"
            disabled={!isEditable}
            // ปรับ text-lg เป็น text-sm และลด padding เพื่อให้ดูไม่ใหญ่เทอะทะ
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:border-blue-400 outline-none disabled:opacity-50 placeholder:font-medium placeholder:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeInputGroup label="เริ่ม" h={startH} m={startM} setH={setStartH} setM={setStartM} disabled={!isEditable} hasError={!!error} />
          <TimeInputGroup label="ถึง" h={endH} m={endM} setH={setEndH} setM={setEndM} disabled={!isEditable} hasError={!!error} />
        </div>
        
        <div className="h-4"> {/* จองพื้นที่ไว้กัน UI ขยับเวลา error โชว์ */}
          {error && (
            <p className="text-[11px] font-bold text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TimeInputGroup({ label, h, m, setH, setM, disabled, hasError }: any) {
  const formatBlur = (val: string, setter: any, max: number) => {
    let num = parseInt(val) || 0
    setter(Math.min(Math.max(num, 0), max).toString().padStart(2, '0'))
  }

  return (
    <div>
      <label className="block text-[10px] font-bold mb-1 text-slate-400 uppercase tracking-tight">{label}</label>
      <div className={`flex items-center bg-white border-2 rounded-xl px-2 py-1.5 transition-all 
        ${disabled ? 'opacity-50 border-slate-200' : 
          hasError ? 'border-red-200 bg-red-50' : 'border-slate-200 focus-within:border-blue-400'}`}>
        <input
          type="text" maxLength={2} value={h} disabled={disabled}
          onChange={e => setH(e.target.value.replace(/\D/g, ''))}
          onBlur={() => formatBlur(h, setH, 23)}
          // ปรับ text-lg เป็น text-sm เพื่อความสมดุล
          className="w-full text-center text-sm font-bold text-slate-600 bg-transparent outline-none"
        />
        <span className="text-slate-300 font-bold text-xs">:</span>
        <input
          type="text" maxLength={2} value={m} disabled={disabled}
          onChange={e => setM(e.target.value.replace(/\D/g, ''))}
          onBlur={() => formatBlur(m, setM, 59)}
          className="w-full text-center text-sm font-bold text-slate-600 bg-transparent outline-none"
        />
      </div>
    </div>
  )
}