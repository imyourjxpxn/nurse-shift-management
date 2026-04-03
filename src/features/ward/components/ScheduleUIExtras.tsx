// features/ward/components/ScheduleUIExtras.tsx
'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'

// --- Toast กำลังบันทึก ---
export function ToastSaving() {
  return (
    <div className="fixed top-10 right-10 z-[9999] bg-white border-2 border-blue-500 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-black text-blue-600 text-sm">กำลังบันทึกข้อมูล...</span>
    </div>
  )
}

// --- Toast บันทึกสำเร็จ ---
export function ToastSuccess() {
  return (
    <div className="fixed top-30 right-10 z-[9999] bg-emerald-400 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="bg-white/20 p-1 rounded-full">
        <CheckCircle2 size={20} strokeWidth={3} />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm">บันทึกข้อมูลเรียบร้อย</span>
      </div>
    </div>
  )
}

// --- ปุ่มแดง Floating แจ้ง Error ---
interface FloatingErrorBtnProps {
  count: number
  onClick: () => void
}

export function FloatingErrorBtn({ count, onClick }: FloatingErrorBtnProps) {
  return (
    <button 
      onClick={onClick} 
      className="fixed bottom-10 right-10 bg-red-500 text-white p-4 rounded-full shadow-md z-50 hover:scale-105 transition-transform active:scale-95"
    >
      <div className="absolute -top-1 -right-1 bg-white text-red-500 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-500">
        {count}
      </div>
      <AlertCircle size={24} />
    </button>
  )
}

// --- สัญลักษณ์สี (Legend) ---
interface LegendItemProps {
  color: string
  label: string
}

export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3.5 h-3.5 rounded border ${color} border-slate-200 shadow-sm`} />
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
    </div>
  )
}