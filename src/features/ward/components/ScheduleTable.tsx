import React from "react"
import { NurseScheduleRow } from "../types"

interface Props {
  scheduleRows: Record<string, NurseScheduleRow>
  onCellClick?: (userId: string, day: number) => void
  daysInMonth: number; 
}

export function ScheduleTable({ scheduleRows, onCellClick, daysInMonth }: Props) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i)
  
  // 🚩 แปลง Object เป็น Array [ [userId, data], ... ] 
  // และเรียงลำดับ Head Nurse ไว้บนสุด (เช็คจากคำว่า "(Head)" ใน displayName)
  const sortedEntries = Object.entries(scheduleRows).sort(([, a], [, b]) => {
    const aIsHead = a.displayName.includes("(Head)");
    const bIsHead = b.displayName.includes("(Head)");
    if (aIsHead && !bIsHead) return -1;
    if (!aIsHead && bIsHead) return 1;
    return 0;
  });

  return (
    <div className="relative w-full overflow-auto max-h-[75vh] rounded-2xl border border-sky-100 shadow-sm bg-white">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-40 bg-sky-50">
          <tr className="bg-sky-100 text-sky-900">
            <th className="sticky left-0 z-50 bg-sky-100 border-b border-r border-sky-200 p-4 text-left min-w-[240px] font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
              รายชื่อพยาบาล
            </th>
            {days.map((d) => (
              <th key={d} className="border-b border-r border-sky-200 p-2 text-center min-w-[130px] font-bold text-sm">
                {d + 1}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {sortedEntries.length > 0 ? (
            sortedEntries.map(([userId, row]) => {
              const { displayName, dailyShifts, summary } = row;
              const isHead = displayName.includes("(Head)");

              return (
                <tr key={userId} className={`group ${isHead ? 'bg-amber-50/30' : 'hover:bg-blue-50/20'}`}>
                  {/* คอลัมน์รายชื่อ (Fixed) */}
                  <td className={`sticky left-0 z-30 border-b border-r border-sky-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isHead ? 'bg-amber-50' : 'bg-white group-hover:bg-blue-50'}`}>
                    <div className={`truncate mb-1 font-bold ${isHead ? 'text-amber-700' : 'text-slate-700'}`}>
                      {displayName}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                      <span className="text-sky-600 bg-sky-50 px-1 rounded border border-sky-100">ช:{summary.morning}</span>
                      <span className="text-orange-600 bg-orange-50 px-1 rounded border border-orange-100">บ:{summary.afternoon}</span>
                      <span className="text-violet-600 bg-violet-50 px-1 rounded border border-violet-100">ด:{summary.night}</span>
                    </div>
                  </td>

                  {/* คอลัมน์วันที่ */}
                  {days.map((day) => (
                    <td 
                      key={day} 
                      onClick={() => onCellClick?.(userId, day)} 
                      className="border-b border-r border-sky-50 p-2 cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-inset"
                    >
                      <div className="flex justify-center items-center min-h-[48px] gap-1.5">
                        {dailyShifts[day]?.map((s, idx) => s && (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-center rounded-lg font-black shadow-sm border ${
                              dailyShifts[day].filter(x => x).length === 1 
                                ? "w-full h-[42px] text-[20px]" 
                                : "min-w-[34px] h-[34px] text-[13px]"
                            } ${getShiftStyles(s)}`}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={daysInMonth + 1} className="p-20 text-center text-slate-400 font-bold">
                ไม่พบข้อมูลพยาบาล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function getShiftStyles(s: string) {
  const styles: any = {
    'ช': "bg-sky-100 text-sky-700 border-sky-200",
    'บ': "bg-orange-100 text-orange-700 border-orange-200",
    'ด': "bg-violet-100 text-violet-700 border-violet-200",
    'E': "bg-rose-50 text-rose-600 border-rose-300 ring-1 ring-rose-200",
    'o': "bg-green-100 text-green-700 border-green-200",
    'ล': "bg-slate-100 text-slate-700 border-slate-200"
  };
  return styles[s] || "bg-blue-50 text-blue-600 border-blue-100";
}