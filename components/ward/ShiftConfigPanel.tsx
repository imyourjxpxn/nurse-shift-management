// components/ward/ShiftConfigPanel.tsx
import React from 'react'

interface ShiftConfigPanelProps {
  isEditable: boolean
}

export function ShiftConfigPanel({ isEditable }: ShiftConfigPanelProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <ShiftCard title="เวรเช้า" bg="bg-sky-50" border="border-sky-100" isEditable={isEditable} defaultTime="08:00" />
      <ShiftCard title="เวรบ่าย" bg="bg-orange-50" border="border-orange-100" isEditable={isEditable} defaultTime="16:00" />
      <ShiftCard title="เวรดึก" bg="bg-violet-50" border="border-violet-100" isEditable={isEditable} defaultTime="00:00" />
    </div>
  )
}

function ShiftCard({ title, bg, border, isEditable, defaultTime }: any) {
  return (
    <div className={`${bg} ${border} border rounded-3xl p-6 shadow-sm`}>
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-slate-500">จำนวนพยาบาลที่ต้องการ</label>
          <input
            type="number"
            placeholder="ระบุจำนวน"
            readOnly={!isEditable}
            className="w-full bg-white/50 rounded-xl px-4 py-2 border border-slate-200 text-sm focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-500">เริ่ม</label>
            <input
              type="time"
              defaultValue={defaultTime} // ใส่ค่าเริ่มต้นเพื่อไม่ให้เป็น --:--
              readOnly={!isEditable}
              className="w-full bg-white/50 rounded-xl px-3 py-2 border border-slate-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-500">ถึง</label>
            <input
              type="time"
              defaultValue="16:00"
              readOnly={!isEditable}
              className="w-full bg-white/50 rounded-xl px-3 py-2 border border-slate-200 text-sm outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}