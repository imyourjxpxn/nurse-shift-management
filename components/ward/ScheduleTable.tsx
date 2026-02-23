import React from "react"

interface Props {
  schedule: Record<string, string[][]>
  onCellClick?: (nurseId: string, day: number) => void
}

export function ScheduleTable({ schedule, onCellClick }: Props) {
  const days = Array.from({ length: 31 }, (_, i) => i)

  return (
    <div className="overflow-auto max-h-[65vh] 
                    rounded-2xl border border-sky-200 
                    bg-sky-50">

      {/* Legend */}
      <div className="p-4 border-b border-sky-200 bg-sky-100">
        <div className="flex gap-6 text-sm text-sky-800">
          <Legend color="bg-sky-200" label="เวรเช้า : ช" />
          <Legend color="bg-orange-200" label="เวรบ่าย : บ" />
          <Legend color="bg-violet-200" label="เวรดึก : ด" />
          <Legend color="bg-amber-200" label="Emergency : E" />
          <Legend color="bg-rose-200" label="ลา : ลา" />
        </div>
      </div>

      <table className="min-w-[1500px] border-collapse text-sm">

        {/* HEADER */}
        <thead className="sticky top-0 z-30">
          <tr className="bg-sky-200 text-sky-900">

            {/* วันที่ (sticky ซ้ายบนสุด) */}
            <th className="border border-sky-200 p-3 text-left 
                           sticky left-0 top-0 
                           bg-sky-200 z-40 min-w-[200px]">
              วันที่ (เดือน ม.ค.)
            </th>

            {days.map((d) => (
              <th
                key={d}
                className="border border-sky-200 p-2 text-center min-w-[55px]"
              >
                {d + 1}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-sky-50">
          {Object.entries(schedule).map(([nurseId, shifts]) => (
            <tr key={nurseId}>

              {/* ชื่อพยาบาล (sticky ซ้าย) */}
              <td className="border border-sky-200 p-3 
                             sticky left-0 
                             bg-sky-100 font-medium z-20">
                {nurseId}
              </td>

              {days.map((day) => {
                const cellShifts = shifts[day] || []

                return (
                  <td
                    key={day}
                    onClick={() => onCellClick?.(nurseId, day)}
                    className="border border-sky-200 p-1 align-top 
                               cursor-pointer hover:bg-sky-100 transition"
                  >
                    <div className="flex flex-col gap-1 min-h-[60px]">

                      {cellShifts.slice(0, 3).map((s, idx) => {
                        const color =
                          s === "ช"
                            ? "bg-sky-200 text-sky-800"
                            : s === "บ"
                            ? "bg-orange-200 text-orange-800"
                            : s === "ด"
                            ? "bg-violet-200 text-violet-800"
                            : s === "E"
                            ? "bg-amber-200 text-amber-800"
                            : "bg-rose-200 text-rose-800"

                        return (
                          <div
                            key={idx}
                            className={`rounded-md text-xs font-medium py-1 text-center ${color}`}
                          >
                            {s}
                          </div>
                        )
                      })}

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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded border border-sky-300 ${color}`} />
      <span>{label}</span>
    </div>
  )
}