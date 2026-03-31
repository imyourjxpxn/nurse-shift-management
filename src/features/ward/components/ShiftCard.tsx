'use client'

import { useEffect, useState } from 'react'
import { TimeInput } from './TimeInput'
import { ShiftSyncData } from '@/features/ward/types'

interface ShiftCardProps {
  title: string
  bg: string
  border: string
  isEditable: boolean
  data: any
  defaultStart: string
  defaultEnd: string
  onSync: (data: ShiftSyncData) => void
  isTimeLocked?: boolean
}

export function ShiftCard({ 
  title, bg, border, isEditable, data, defaultStart, defaultEnd, onSync,
  isTimeLocked = false 
}: ShiftCardProps) {
  const [required, setRequired] = useState('')
  const [startH, setStartH] = useState('--')
  const [startM, setStartM] = useState('--')
  const [endH, setEndH] = useState('--')
  const [endM, setEndM] = useState('--')
  const [error, setError] = useState('')

  // 1. Initial Load: ดึงข้อมูลจาก DB
  useEffect(() => {
    const parse = (t: string) => {
      if (!t || t === "--:--" || t === "") return { h: '--', m: '--' };
      const parts = t.split(':')
      return { 
        h: parts[0]?.padStart(2, '0') || '--', 
        m: parts[1]?.padStart(2, '0') || '--' 
      }
    }
    
    const s = parse(data?.startTime || defaultStart)
    const e = parse(data?.endTime || defaultEnd)
    
    setRequired(data?.requiredPeople?.toString() || '')
    setStartH(s.h); setStartM(s.m); setEndH(e.h); setEndM(e.m)
  }, [data, defaultStart, defaultEnd])

  // 2. Sync State & Validation
  useEffect(() => {
    const isMissingTime = startH === '--' || endH === '--' || startM === '--' || endM === '--';
    const isMissingPeople = !required || parseInt(required) <= 0;

    if (isMissingTime) {
      setError('')
      onSync({
        shiftTemplateId: data?.shiftTemplateId,
        startTime: "--:--",
        endTime: "--:--",
        requiredPeople: parseInt(required) || 0,
        hasError: true
      })
      return
    }

    const h1 = parseInt(startH); const m1 = parseInt(startM)
    const h2 = parseInt(endH); const m2 = parseInt(endM)
    const startTotal = h1 * 60 + m1
    let endTotal = h2 * 60 + m2

    if (endTotal <= startTotal) endTotal += 24 * 60 
    
    const diff = endTotal - startTotal
    const isOverTime = diff > 480 
    const isSameTime = startTotal === (h2 * 60 + m2)

    let currentError = ''
    if (isSameTime) currentError = 'เวลาเริ่มและจบห้ามเป็นเวลาเดียวกัน'
    else if (isOverTime) currentError = 'ระยะเวลาเวรห้ามเกิน 8 ชม.'
    
    setError(currentError)

    onSync({
      shiftTemplateId: data?.shiftTemplateId,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      requiredPeople: parseInt(required) || 0,
      hasError: !!currentError || isMissingPeople
    })
  }, [startH, startM, endH, endM, required, data?.shiftTemplateId])

  return (
    <div className={`relative ${bg} ${border} border-2 rounded-3xl p-6 shadow-sm transition-all 
      ${error ? 'border-red-300 ring-2 ring-red-50' : 'hover:shadow-md'}`}>

      <h3 className="text-base font-black text-slate-800 mb-4 uppercase">
        {title}
      </h3>
      
      <div className="space-y-4">
        {/* จำนวนพยาบาล */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 uppercase leading-tight 
            ${!isEditable ? 'text-slate-400' : 'text-slate-500'}`}>
            จำนวนพยาบาลที่ต้องการ
          </label>
          <input
            type="text"
            className={`w-full border-2 rounded-2xl px-4 py-2 text-lg font-bold outline-none transition-all
              ${!isEditable 
                ? 'bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-white border-slate-200 focus:border-blue-400 hover:border-slate-300 text-slate-700 shadow-sm'}`}
            value={required} 
            onChange={e => setRequired(e.target.value.replace(/\D/g, ''))}
            disabled={!isEditable} 
            placeholder="0"
          />
        </div>

        {/* เวลาเวร */}
        <div>
          <div className="flex gap-4">
            <TimeInput 
              label="เริ่ม" 
              h={startH} m={startM} setH={setStartH} setM={setStartM} 
              disabled={!isEditable || isTimeLocked} 
              hasError={!!error} 
            />
            <TimeInput 
              label="ถึง" 
              h={endH} m={endM} setH={setEndH} setM={setEndM} 
              disabled={!isEditable || isTimeLocked} 
              hasError={!!error} 
            />
          </div>

          {/* 🚩 ข้อความแจ้งเตือนใต้ช่องเวลา (เฉพาะ Head Nurse ที่โดนล็อคเวลา) */}
          {isEditable && isTimeLocked && !error && (
            <p className="mt-2 text-[10px] text-slate-400">
              * แก้ไขได้เฉพาะจำนวนคน
            </p>
          )}
        </div>

        {/* ส่วนแสดง Error (ถ้ามี) */}
        <div className="min-h-[16px]">
          {error && (
            <p className="text-[11px] font-bold text-red-500 animate-pulse">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}