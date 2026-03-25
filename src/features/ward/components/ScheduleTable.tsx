// components/ward/ScheduleTable.tsx
import React from "react"

interface Props {
  schedule: Record<string, string[][]>
  onCellClick?: (nurseId: string, day: number) => void
}

export function ScheduleTable({ schedule, onCellClick }: Props) {
  const days = Array.from({ length: 31 }, (_, i) => i)

  return (
    <div className="relative w-full overflow-auto max-h-[75vh] rounded-2xl border border-sky-100 shadow-sm bg-white">
      <table className="w-full border-separate border-spacing-0">
        
        {/* 1. ส่วนหัวตาราง (รวม Legend และวันที่) */}
        <thead className="sticky top-0 z-40 bg-sky-50">
          

          {/* แถวที่ 2: วันที่ (ส่วนแถบสีฟ้าที่วงไว้) */}
          <tr className="bg-sky-100 text-sky-900">
            <th className="sticky left-0 z-50 bg-sky-100 border-b border-r border-sky-200 p-3 text-left min-w-[180px] font-bold">
              วันที่ (เดือน ม.ค.)
            </th>
            {days.map((d) => (
              <th key={d} className="border-b border-r border-sky-200 p-2 text-center min-w-[50px] font-bold">
                {d + 1}
              </th>
            ))}
          </tr>
        </thead>

        {/* 2. ส่วนเนื้อหาตาราง */}
        <tbody className="bg-white">
          {Object.entries(schedule).map(([nurseId, shifts]) => (
            <tr key={nurseId} className="hover:bg-sky-50/30 transition-colors">
              
              {/* ✅ คอลัมน์ชื่อพยาบาล (Sticky ฝั่งซ้ายตามที่วงแดงไว้) */}
              <td className="sticky left-0 z-30 bg-white border-b border-r border-sky-100 p-4 font-medium text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {nurseId}
              </td>

              {/* ช่องข้อมูลเวร */}
              {days.map((day) => {
                const cellShifts = shifts[day] || []
                return (
                  <td
                    key={day}
                    onClick={() => onCellClick?.(nurseId, day)}
                    className="border-b border-r border-sky-50 p-1 cursor-pointer align-top"
                  >
                    <div className="flex flex-col gap-1 min-h-[55px]">
                      {cellShifts.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          className={`rounded px-1 py-0.5 text-[10px] font-bold text-center ${getShiftColor(s)}`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Helper Function สำหรับสี
function getShiftColor(s: string) {
  switch (s) {
    case 'ช': return "bg-sky-200 text-sky-800";
    case 'บ': return "bg-orange-200 text-orange-800";
    case 'ด': return "bg-violet-200 text-violet-800";
    case 'E': return "bg-amber-200 text-amber-800";
    default: return "bg-rose-200 text-rose-800";
  }
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <div className={`w-3.5 h-3.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}