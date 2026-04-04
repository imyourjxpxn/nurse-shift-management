'use client'

import React from "react"
import { NurseScheduleRow, AssignmentType, ShiftCellData } from "../types"

interface Props {
  scheduleRows: Record<string, NurseScheduleRow>
  onCellClick?: (userId: string, day: number) => void
  daysInMonth: number;
  pendingAssignments?: any[]; 
  isDisabled?: boolean; 
  userRole?: string;
}

// 🚩 กำหนดลำดับการแสดงผลในช่องตาราง (ช > บ > ด > E > o > ล)
const DISPLAY_ORDER: Record<string, number> = {
  'ช': 1,
  'บ': 2,
  'ด': 3,
  'E': 4,
  'o': 5,
  'ล': 6
};

export function ScheduleTable({ 
  scheduleRows, 
  onCellClick, 
  daysInMonth, 
  pendingAssignments = [],
  isDisabled = false 
}: Props) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i)
  
  const sortedEntries = Object.entries(scheduleRows).sort(([, a], [, b]) => {
    const aIsHead = a.displayName.includes("(Head)");
    const bIsHead = b.displayName.includes("(Head)");
    if (aIsHead && !bIsHead) return -1;
    if (!aIsHead && bIsHead) return 1;
    return 0;
  });

  const getPendingCode = (item: any) => {
    if (item.templateType === 'morning') return 'ช';
    if (item.templateType === 'afternoon') return 'บ';
    if (item.templateType === 'night') return 'ด';
    if (item.assignmentType === AssignmentType.EMERGENCY) return 'E';
    if (item.assignmentType === AssignmentType.OFF) return 'o';
    if (item.assignmentType === AssignmentType.LEAVE) return 'ล';
    return '?';
  };

  return (
    <div className="relative w-full overflow-auto max-h-[75vh] rounded-2xl border border-sky-100 shadow-sm bg-white">
      <table className={`w-full border-separate border-spacing-0 text-slate-900 transition-all duration-300
        ${isDisabled ? 'opacity-50 grayscale-[0.5] select-none pointer-events-none' : 'opacity-100'}`}>
        
        <thead className="sticky top-0 z-40">
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
              const { displayName, dailyShifts } = row;
              const isHead = displayName.includes("(Head)");

              return (
                <tr key={userId} className={`group ${isHead ? 'bg-amber-50/30' : 'hover:bg-blue-50/20'}`}>
                  <td className={`sticky left-0 z-30 border-b border-r border-sky-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isHead ? 'bg-amber-50' : 'bg-white group-hover:bg-blue-50'}`}>
                    <div className={`truncate font-bold ${isHead ? 'text-amber-700' : 'text-slate-700'}`}>
                      {displayName}
                    </div>
                  </td>

                  {days.map((day) => {
                    // 1. ดึงข้อมูลเวรจาก Database (ที่มีอยู่แล้ว)
                    const dbShifts = (dailyShifts[day] || []).filter((s): s is ShiftCellData => s !== null);
                    
                    // 2. ดึงข้อมูลเวรที่รอการบันทึก (Pending)
                    const pShifts = pendingAssignments
                      .filter(p => p.userId === userId && p.day === (day + 1))
                      .map(p => ({
                        code: getPendingCode(p),
                        isPending: true 
                      }));

                    // 🚩 3. รวมร่างและทำการ SORT ตามลำดับที่กำหนดไว้ (ช > บ > ด ...)
                    const combinedShifts = [...dbShifts, ...pShifts].sort((a, b) => {
                      const orderA = DISPLAY_ORDER[a.code] || 99;
                      const orderB = DISPLAY_ORDER[b.code] || 99;
                      return orderA - orderB;
                    });

                    return (
                      <td 
                        key={day} 
                        onClick={() => !isDisabled && onCellClick?.(userId, day)} 
                        className={`border-b border-r border-sky-50 p-2 transition-all 
                          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-sky-50/50'}`}
                      >
                        <div className="flex justify-center items-center min-h-[48px] gap-1.5">
                          {combinedShifts.map((s, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-center rounded-lg font-black border text-[13px] w-[34px] h-[34px] transition-all
                                ${getShiftStyles(s.code)} 
                                ${s.isPending ? 'opacity-50 border-dashed border-slate-400 animate-pulse scale-90' : 'shadow-sm'}
                              `}
                            >
                              {s.code}
                            </div>
                          ))}
                          {combinedShifts.length === 0 && (
                            <span className="text-slate-200 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={daysInMonth + 1} className="text-center py-10 text-gray-400 text-sm">
                ไม่พบรายชื่อพยาบาลในวอร์ดนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function getShiftStyles(s: string) {
  const styles: Record<string, string> = {
    'ช': "bg-sky-100 text-sky-700 border-sky-200",
    'บ': "bg-orange-100 text-orange-700 border-orange-200",
    'ด': "bg-violet-100 text-violet-700 border-violet-200",
    'E': "bg-rose-50 text-rose-600 border-rose-300 ring-1 ring-rose-100",
    'o': "bg-green-100 text-green-700 border-green-200",
    'ล': "bg-slate-100 text-slate-700 border-slate-200"
  };
  return styles[s] || "bg-blue-50 text-blue-600 border-blue-100";
}