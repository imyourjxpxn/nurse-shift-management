import React from "react"

interface Props {
  schedule: Record<string, string[][]>
  onCellClick?: (nurseId: string, day: number) => void
  daysInMonth: number; 
}

export function ScheduleTable({ schedule, onCellClick, daysInMonth }: Props) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i)

  return (
    <div className="relative w-full overflow-auto max-h-[75vh] rounded-2xl border border-sky-100 shadow-sm bg-white">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-40 bg-sky-50">
          <tr className="bg-sky-100 text-sky-900">
            <th className="sticky left-0 z-50 bg-sky-100 border-b border-r border-sky-200 p-4 text-left min-w-[200px] font-bold text-base">
              รายชื่อพยาบาล
            </th>
            {days.map((d) => (
              <th key={d} className="border-b border-r border-sky-200 p-2 text-center min-w-[120px] font-bold text-sm">
                {d + 1}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {Object.entries(schedule).map(([nurseId, shifts]) => (
            <tr key={nurseId} className="group hover:bg-blue-50/20 transition-colors">
              <td className="sticky left-0 z-30 bg-white border-b border-r border-sky-100 p-4 font-bold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50">
                {nurseId}
              </td>

              {days.map((day) => {
                const cellShifts = shifts[day] || []
                return (
                  <td
                    key={day}
                    onClick={() => onCellClick?.(nurseId, day)}
                    className="border-b border-r border-sky-50 p-2 cursor-pointer align-middle hover:bg-white hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all"
                  >
                    {/* ✅ บังคับเรียงแถวเดียว (no-wrap) และจัดกึ่งกลาง */}
                    <div className="flex flex-row flex-nowrap gap-1.5 justify-center items-center min-h-[48px] w-full">
                      {cellShifts.map((s, idx) => (
                        <div
                          key={idx}
                          className={`
                            flex items-center justify-center
                            rounded-md px-2 py-1 text-[13px] font-black leading-none
                            min-w-[32px] h-[32px] text-center shadow-sm border
                            ${getShiftStyles(s)}
                          `}
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

function getShiftStyles(s: string) {
  switch (s) {
    case 'ช': return "bg-sky-100 text-sky-700 border-sky-200";
    case 'บ': return "bg-orange-100 text-orange-700 border-orange-200";
    case 'ด': return "bg-violet-100 text-violet-700 border-violet-200";
    case 'E': return "bg-rose-100 text-rose-700 border-rose-200";
    case 'o': return "bg-green-100 text-green-700 border-green-200";
    case 'ล': return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-blue-50 text-blue-600 border-blue-100";
  }
}