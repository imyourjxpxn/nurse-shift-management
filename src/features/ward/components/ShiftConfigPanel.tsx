'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShiftTemplate } from '@/features/ward/types'
import { getShiftTemplates } from '@/features/ward/api/getShiftTemplates'

interface ShiftConfigPanelProps {
  isEditable: boolean
}

export function ShiftConfigPanel({ isEditable }: ShiftConfigPanelProps) {
  const params = useParams()
  const wardId = params.wardId as string
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!wardId) return
      try {
        setLoading(true)
        const data = await getShiftTemplates(wardId)
        setTemplates(data)
      } catch (error) {
        console.error("Error loading templates:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [wardId])

  // ปรับให้หาแบบ Case-insensitive (เผื่อ Backend ส่งตัวใหญ่)
  const getShiftByType = (type: string) => 
    templates.find(t => t.type.toLowerCase() === type.toLowerCase())

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-100 rounded-3xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <ShiftCard 
        title="เวรเช้า (ช)" 
        bg="bg-sky-50" 
        border="border-sky-100" 
        isEditable={isEditable} 
        data={getShiftByType('morning')} 
        defaultStart="08:00"
        defaultEnd="16:00"
      />
      <ShiftCard 
        title="เวรบ่าย (บ)" 
        bg="bg-orange-50" 
        border="border-orange-100" 
        isEditable={isEditable} 
        data={getShiftByType('afternoon')} 
        defaultStart="16:00"
        defaultEnd="00:00"
      />
      <ShiftCard 
        title="เวรดึก (ด)" 
        bg="bg-violet-50" 
        border="border-violet-100" 
        isEditable={isEditable} 
        data={getShiftByType('night')} 
        defaultStart="00:00"
        defaultEnd="08:00"
      />
    </div>
  )
}

function ShiftCard({ title, bg, border, isEditable, data, defaultStart, defaultEnd }: any) {
  const [required, setRequired] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    // กรณีที่ 1: มีข้อมูลจาก API (เคยบันทึกไว้แล้ว)
    if (data) {
      setRequired(data.requiredPeople?.toString() || '0')
      setStartTime(data.startTime || defaultStart)
      setEndTime(data.endTime || defaultEnd)
    } 
    // กรณีที่ 2: วอร์ดใหม่กิ๊ก (data เป็น undefined) 
    // ให้ใช้ค่า Default ที่ส่งมาจากตัวแม่ (ShiftConfigPanel)
    else {
      setRequired('0') // เริ่มต้นที่ 0 คน
      setStartTime(defaultStart) // เช่น 08:00
      setEndTime(defaultEnd)     // เช่น 16:00
    }
  }, [data, defaultStart, defaultEnd]) // ติดตามเผื่อมีการเปลี่ยนวอร์ด

  const handleTimeChange = (val: string, setter: (v: string) => void) => {
    let digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      setter(`${digits.slice(0, 2)}:${digits.slice(2)}`)
    } else {
      setter(digits)
    }
  }

  return (
    <div className={`${bg} ${border} border-2 rounded-3xl p-6 shadow-sm transition-all`}>
      <h3 className="text-base font-black text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wider">
            จำนวนพยาบาลที่ต้องการ
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={required}
            onChange={(e) => setRequired(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            disabled={!isEditable}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-lg font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wider">เริ่ม</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00:00"
              value={startTime}
              onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
              disabled={!isEditable}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-3 py-2.5 text-center text-lg font-bold text-slate-700 outline-none focus:border-blue-400 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wider">ถึง</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00:00"
              value={endTime}
              onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
              disabled={!isEditable}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-3 py-2.5 text-center text-lg font-bold text-slate-700 outline-none focus:border-blue-400 transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}