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
            <th className="sticky left-0 z-50 bg-sky-100 border-b border-r border-sky-200 p-4 text-left min-w-[220px] font-bold text-base shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
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
          {Object.entries(schedule).map(([nurseId, shifts]) => (
            <tr key={nurseId} className="group hover:bg-blue-50/20 transition-colors">
              {/* คอลัมน์รายชื่อพยาบาล (Sticky) */}
              <td className="sticky left-0 z-30 bg-white border-b border-r border-sky-100 p-4 font-bold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50">
                {nurseId}
              </td>

              {/* คอลัมน์วันที่ในแต่ละเดือน */}
              {days.map((day) => {
                const cellShifts = shifts[day] || []
                
                // 🚩 Logic: เช็คว่าเป็นเวรพิเศษ (E, ล, o, off) หรือไม่
                // เงื่อนไขคือในวันนั้นมีข้อมูลแค่ 1 อย่าง และไม่ใช่ช่องว่าง
                const isSpecial = cellShifts.length === 1 && cellShifts[0] !== "";

                return (
                  <td
                    key={day}
                    onClick={() => onCellClick?.(nurseId, day)}
                    className="border-b border-r border-sky-50 p-2 cursor-pointer align-middle hover:bg-white hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all"
                  >
                    {/* Container จัดวางเวร: ใช้ justify-center เพื่อให้ทุกอย่างอยู่กึ่งกลางช่องวันที่ */}
                    <div className="flex flex-row flex-nowrap gap-1.5 justify-center items-center min-h-[48px] w-full">
                      {cellShifts.map((s, idx) => {
                        // ถ้าไม่มีข้อมูลใน slot (เช่น ["ช", "", ""]) ไม่ต้องวาดกล่องให้รก
                        if (!s) return null;

                        return (
                          <div
                            key={idx}
                            className={`
                              flex items-center justify-center
                              rounded-lg font-black leading-none
                              shadow-sm border transition-all
                              ${isSpecial 
                                ? "w-full h-[42px] text-[20px] bg-opacity-95 shadow-md" // ✅ แบบพิเศษ: เต็มช่อง ตัวใหญ่เด่นๆ
                                : "min-w-[34px] h-[34px] text-[13px] px-2" // ✅ แบบปกติ: กล่องมาตรฐาน ช/บ/ด
                              }
                              ${getShiftStyles(s)}
                            `}
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

/**
 * ฟังก์ชันกำหนดสไตล์ตามประเภทเวร
 */
function getShiftStyles(s: string) {
  switch (s) {
    case 'ช': 
      return "bg-sky-100 text-sky-700 border-sky-200";
    case 'บ': 
      return "bg-orange-100 text-orange-700 border-orange-200";
    case 'ด': 
      return "bg-violet-100 text-violet-700 border-violet-200";
    case 'E': 
      return "bg-rose-50 text-rose-600 border-rose-300 ring-1 ring-rose-200"; // แดงฉุกเฉิน
    case 'o': 
      return "bg-green-100 text-green-700 border-green-200";
    case 'ล': 
      return "bg-slate-100 text-slate-700 border-slate-200";
    default: 
      return "bg-blue-50 text-blue-600 border-blue-100";
  }
}