'use client'

import { useState } from 'react'
import { ShiftType } from '@/app/wards/[wardId]/page'

interface Props {
  onClose: () => void
  onSelect: (shifts: ShiftType[]) => void
}

export function ShiftSelectModal({ onClose, onSelect }: Props) {
  const workShifts: ShiftType[] = ['ช', 'บ', 'ด']
  const otherShifts: ShiftType[] = ['ลา', 'Off', 'E']

  const [selectedWork, setSelectedWork] = useState<ShiftType[]>([])
  const [selectedOther, setSelectedOther] = useState<ShiftType | null>(null)

  const toggleWork = (shift: ShiftType) => {
    setSelectedOther(null) // ถ้าเลือกเวรทำงาน ให้ล้างเวรอื่น

    setSelectedWork(prev =>
      prev.includes(shift)
        ? prev.filter(s => s !== shift)
        : [...prev, shift].slice(0, 3)
    )
  }

  const toggleOther = (shift: ShiftType) => {
    setSelectedWork([]) // ถ้าเลือกเวรอื่น ให้ล้างเวรทำงาน
    setSelectedOther(prev => (prev === shift ? null : shift))
  }

  const handleConfirm = () => {
    if (selectedOther) {
      onSelect([selectedOther])
    } else {
      onSelect(selectedWork.slice(0, 3))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-6">

        <h2 className="text-xl font-semibold">เลือกเวร</h2>

        {/* เวรทำงาน */}
        <div>
          <div className="font-medium mb-3">
            เวรทำงาน (เลือกได้หลาย สูงสุด 3)
          </div>

          <div className="grid grid-cols-2 gap-3">
            {workShifts.map(shift => (
              <button
                key={shift}
                onClick={() => toggleWork(shift)}
                className={`p-3 rounded-xl border text-center font-medium transition
                  ${
                    selectedWork.includes(shift)
                      ? 'bg-blue-200 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

        {/* เวรอื่น */}
        <div>
          <div className="font-medium mb-3">
            เวรอื่น (เลือกได้อย่างเดียว)
          </div>

          <div className="grid grid-cols-2 gap-3">
            {otherShifts.map(shift => (
              <button
                key={shift}
                onClick={() => toggleOther(shift)}
                className={`p-3 rounded-xl border text-center font-medium transition
                  ${
                    selectedOther === shift
                      ? 'bg-gray-300 border-gray-600'
                      : 'hover:bg-gray-100'
                  }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

        {/* ปุ่มล่าง */}
        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          >
            บันทึก
          </button>

          <button
            onClick={onClose}
            className="w-full text-red-500 hover:underline"
          >
            ยกเลิก
          </button>
        </div>

      </div>
    </div>
  )
}