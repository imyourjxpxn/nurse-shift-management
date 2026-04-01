import React from "react"
import { NurseScheduleRow } from "../types"

interface Props {
  // รับข้อมูลแถวทั้งหมดจาก Hook (Key คือ userId)
  scheduleRows: Record<string, NurseScheduleRow>
}

export function NurseSummaryPanel({ scheduleRows }: Props) {
  // แปลง Object เป็น Array [ [userId, data], [userId, data] ] 
  // เพื่อให้เราได้ทั้ง ID มาทำ key และได้ data มาแสดงผล
  const summaryEntries = Object.entries(scheduleRows);

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white mt-6">
      <div className="min-w-[900px] md:min-w-full bg-gray-100 p-6 space-y-4">
        
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          สรุปเวรของพยาบาลแต่ละคนเดือนนี้
        </h3>

        {summaryEntries.length > 0 ? (
          summaryEntries.map(([userId, row]) => {
            const { displayName, summary } = row;
            return (
              <div
                key={userId} // ใช้ userId จาก Key ของ Record มาเป็น key ของ list
                className="flex justify-between items-center py-3 border-b border-gray-200 text-sm hover:bg-white/50 transition-colors"
              >
                <span className="font-bold text-slate-700 min-w-[200px]">
                  {displayName}
                </span>

                <div className="flex gap-1 text-gray-600">
                  <span className="w-24 text-sky-700">เวรเช้า : {summary.morning}</span>
                  <span className="w-24 text-orange-700">เวรบ่าย : {summary.afternoon}</span>
                  <span className="w-24 text-violet-700">เวรดึก : {summary.night}</span>
                  <span className="w-32 text-rose-600 font-bold">Emergency : {summary.emergency}</span>
                  <span className="w-20 text-slate-500">ลา : {summary.leave}</span>
                  <span className="font-bold text-blue-600 min-w-[100px] text-right bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    รวมเวร : {summary.totalShifts}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            ไม่พบรายชื่อพยาบาลในระบบ
          </div>
        )}
      </div>
    </div>
  )
}