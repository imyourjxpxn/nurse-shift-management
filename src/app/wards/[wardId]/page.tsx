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
        // ตรวจสอบใน Console ว่า endTime กับ requiredPeople มาไหม
        console.log("Check API Data:", data) 
        setTemplates(data)
      } catch (error) {
        console.error("Error loading templates:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [wardId])

  // ฟังก์ชันหาข้อมูลแยกตาม Type โดยเช็คทั้งตัวเล็กและตัวใหญ่เพื่อความชัวร์
  const getShiftByType = (type: string) => 
    templates.find(t => t.type.toLowerCase() === type.toLowerCase())

  if (loading) return <div className="p-4 text-center text-slate-400 animate-pulse font-bold">กำลังโหลดข้อมูล...</div>

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <ShiftCard 
        title="เวรเช้า" 
        bg="bg-sky-50" 
        border="border-sky-100" 
        isEditable={isEditable} 
        data={getShiftByType('morning')} 
        defaultStart="08:00"
      />
      <ShiftCard 
        title="เวรบ่าย" 
        bg="bg-orange-50" 
        border="border-orange-100" 
        isEditable={isEditable} 
        data={getShiftByType('afternoon')} 
        defaultStart="16:00"
      />
      <ShiftCard 
        title="เวรดึก" 
        bg="bg-violet-50" 
        border="border-violet-100" 
        isEditable={isEditable} 
        data={getShiftByType('night')} 
        defaultStart="00:00"
      />
    </div>
  )
}

function ShiftCard({ title, bg, border, isEditable, data, defaultStart }: any) {
  // สร้าง Local State เพื่อรองรับการพิมพ์เอง
  const [required, setRequired] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  // เมื่อข้อมูลจาก API (data) เปลี่ยน ให้เอาค่ามาใส่ใน Input
  useEffect(() => {
    if (data) {
      // ✅ ดึง requiredPeople (ถ้าไม่มีให้เป็นค่าว่าง)
      setRequired(data.requiredPeople?.toString() || '')
      // ✅ ดึง startTime
      setStart(data.startTime || defaultStart)
      // ✅ ดึง endTime (ตรวจสอบชื่อ Property ให้ตรงกับ Schema)
      setEnd(data.endTime || '')
    }
  }, [data, defaultStart])

  // ฟังก์ชันเติม : อัตโนมัติ (พิมพ์ 0805 -> 08:05)
  const handleTimeChange = (val: string, setter: (v: string) => void) => {
    let digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      setter(`${digits.slice(0, 2)}:${digits.slice(2)}`)
    } else {
      setter(digits)
    }
  }

  return (
    <div className={`${bg} ${border} border rounded-3xl p-6 shadow-sm`}>
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-slate-500 tracking-tight">จำนวนพยาบาลที่ต้องการ</label>
          <input
            type="text"
            inputMode="numeric"
            value={required}
            onChange={(e) => setRequired(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            disabled={!isEditable}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-2 text-lg font-bold text-slate-700 focus:border-blue-400 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-500">เริ่ม</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00:00"
              value={start}
              onChange={(e) => handleTimeChange(e.target.value, setStart)}
              disabled={!isEditable}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-3 py-2 text-center text-lg font-bold text-slate-700 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-500">ถึง</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00:00"
              value={end}
              onChange={(e) => handleTimeChange(e.target.value, setEnd)}
              disabled={!isEditable}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-3 py-2 text-center text-lg font-bold text-slate-700 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}