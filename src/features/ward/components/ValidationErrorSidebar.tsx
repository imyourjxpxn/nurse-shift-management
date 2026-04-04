'use client'

import { X, AlertTriangle, XCircle } from 'lucide-react'

interface ErrorItem {
  msg: string
  type: 'error' | 'warning'
}

export function ValidationErrorSidebar({ isOpen, onClose, errors = [] }: { isOpen: boolean; onClose: () => void; errors: ErrorItem[] }) {
  // 🚩 เช็คว่ามี Error ที่ต้องแก้ไหม เพื่อเปลี่ยนคำโปรย
  const hasBlockingError = errors.some(err => err.type === 'error');

  return (
    <>
      {/* Background Overlay */}
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000]" onClick={onClose} />}
      
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white z-[10001] shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* 🚩 1. Header Section - แก้ไขโครงสร้างให้คำพูดอยู่บรรทัดล่าง */}
        <div className="p-8 border-b bg-red-50/30 flex flex-col gap-3 shrink-0 border-red-600">
          <div className="flex justify-between items-center w-full">
            <h2 className="font-black text-2xl text-red-600 uppercase tracking-tight leading-none">
              แจ้งเตือนจากระบบ
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors">
              <X size={28} className="text-red-600" />
            </button>
          </div>

          <span className="text-sm font-medium text-red-500/80 leading-relaxed">
            {hasBlockingError 
              ? "ข้อผิดพลาดที่ต้องแก้ไขให้ถูกต้องก่อนบันทึก" 
              : "ข้อแนะนำเพิ่มเติม (ระบบบันทึกข้อมูลของคุณแล้วแต่ควรแก้ไขรายละเอียดต่อไปนี้เพื่อความถูกต้อง)"}
          </span>
        </div>

        {/* 🚩 2. Content Section - แยกออกมาอยู่ข้างนอก Header */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {errors.map((errorObj, idx) => {
            const isWarning = errorObj.type === 'warning'

            return (
              <div 
                key={idx} 
                className={`border-l-[6px] p-5 rounded-r-xl shadow-sm transition-all flex gap-3 items-start ${
                  isWarning 
                    ? 'bg-amber-50 border-amber-500 hover:bg-amber-100/50' 
                    : 'bg-red-50 border-red-500 hover:bg-red-100/50'
                }`}
              >
                <div className="mt-1">
                  {isWarning ? <AlertTriangle size={20} className="text-amber-500" /> : <XCircle size={20} className="text-red-500" />}
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isWarning ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {isWarning ? 'Warning' : 'Validation Error'}
                  </span>
                  
                  <p className={`text-[15px] font-bold leading-relaxed ${
                    isWarning ? 'text-amber-900' : 'text-red-900'
                  }`}>
                    {errorObj.msg}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}