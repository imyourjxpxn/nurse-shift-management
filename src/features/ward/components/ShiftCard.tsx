'use client'

import { useEffect, useState } from 'react'
import { TimeInput } from './TimeInput'
import { ShiftSyncData } from '@/features/ward/types'

interface ShiftCardProps {
  title: string
  bg: string
  border: string
  isEditable: boolean      // คุมสิทธิ์ภาพรวม (เช่น เป็น Head Nurse หรือไม่)
  data: any                // ข้อมูล Template จาก API
  defaultStart: string
  defaultEnd: string
  onSync: (data: ShiftSyncData) => void
  isTimeLocked?: boolean   // 🔒 ล็อกเฉพาะเวลา (ถ้ามี Template ID แล้ว)
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

  // 1. ดึงข้อมูลจาก Database มาใส่ตอนโหลดหน้า (Initial Load)
  useEffect(() => {
    const parse = (t: string) => {
      if (!t || t === "--:--") return { h: '--', m: '--' };
      const parts = t.split(':')
      return { 
        h: parts[0]?.padStart(2, '0') || '--', 
        m: parts[1]?.padStart(2, '0') || '--' 
      }
    }
    
    // ลำดับความสำคัญ: ข้อมูลจาก DB > ค่า Default ที่ส่งมา
    const s = parse(data?.startTime || defaultStart)
    const e = parse(data?.endTime || defaultEnd)
    
    setRequired(data?.requiredPeople?.toString() || '')
    setStartH(s.h); setStartM(s.m); setEndH(e.h); setEndM(e.m)
  }, [data, defaultStart, defaultEnd])

  // 2. คำนวณ Error และส่งข้อมูลกลับไปหาหน้าหลัก (Sync State)
  useEffect(() => {
    // ถ้ายังกรอกไม่ครบ ไม่ต้องเช็ค Overlap แต่ส่ง hasError ไปกัน Save
    if (startH === '--' || endH === '--' || startM === '--' || endM === '--') {
      setError('')
      onSync({
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

    if (endTotal <= startTotal) endTotal += 24 * 60 // กรณีข้ามคืน
    
    const diff = endTotal - startTotal
    const isOverTime = diff > 480 // เกิน 8 ชม.
    const isSameTime = startTotal === (h2 * 60 + m2)
    const isMissingPeople = !required || parseInt(required) <= 0

    let currentError = ''
    if (isSameTime) currentError = 'เวลาเริ่มและจบห้ามเป็นเวลาเดียวกัน'
    else if (isOverTime) currentError = 'ระยะเวลาเวรห้ามเกิน 8 ชม.'
    
    setError(currentError)

    // ส่งข้อมูลกลับไปที่ SchedulePage ผ่าน onDataSync
    onSync({
      shiftTemplateId: data?.shiftTemplateId,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      requiredPeople: parseInt(required) || 0,
      hasError: !!currentError || isMissingPeople
    })
  }, [startH, startM, endH, endM, required])

  return (
    <div className={`relative ${bg} ${border} border-2 rounded-3xl p-6 shadow-sm transition-all 
      ${error ? 'border-red-300 ' : 'hover:shadow-md'}`}>

      <h3 className="text-base font-black text-slate-800 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {/* ส่วนที่ 1: จำนวนพยาบาล (แก้ได้ตลอดถ้าเป็น Head Nurse) */}
        <div>
          <label className="block text-[10px] font-bold mb-1 text-slate-400 uppercase leading-tight">
            จำนวนพยาบาลที่ต้องการ
          </label>
          <input
            type="text"
            className={`w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-2 text-lg font-bold outline-none transition-all
              ${!isEditable ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'focus:border-blue-400 hover:border-slate-300'}`}
            value={required} 
            onChange={e => setRequired(e.target.value.replace(/\D/g, ''))}
            disabled={!isEditable} 
            placeholder="0"
          />
        </div>

        {/* ส่วนที่ 2: เวลาเวร (ล็อกถ้าเคยบันทึกแล้ว) */}
        <div className="flex gap-4">
          <TimeInput 
            label="เริ่ม" 
            h={startH} m={startM} setH={setStartH} setM={setStartM} 
            disabled={!isEditable || isTimeLocked} // ล็อกถ้าไม่ใช่ Head Nurse หรือถ้ามี Template แล้ว
            hasError={!!error} 
          />
          <TimeInput 
            label="ถึง" 
            h={endH} m={endM} setH={setEndH} setM={setEndM} 
            disabled={!isEditable || isTimeLocked} 
            hasError={!!error} 
          />
        </div>

        {/* Error Message Display */}
        <div className="min-h-[16px]">
          {error ? (
            <p className="text-[11px] font-bold text-red-500">{error}</p>
          ) : isTimeLocked && isEditable ? (
            <p className="text-[10px] font-medium text-slate-400 italic">* ไม่สามารถแก้ไขเวลาได้</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}