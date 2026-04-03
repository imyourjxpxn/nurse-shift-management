'use client'

import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  errors: string[]
}

export function ValidationErrorSidebar({ isOpen, onClose, errors }: SidebarProps) {
  
  // ล็อก Scroll หน้าจอหลักเมื่อ Sidebar เปิด เพื่อป้องกันความสับสน
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      {/* 1. Overlay พื้นหลัง (มืดลงและเบลอ) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000] animate-in fade-in duration-300" 
          onClick={onClose} 
        />
      )}

      {/* 2. Panel ของ Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white z-[10001] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* --- 🚩 ส่วน Header: แจ้งเตือนระบบแบบเน้นชัดเจน --- */}
        <div className="relative p-8 border-t-[8px] border-red-600 border-b border-slate-100 flex justify-between items-center bg-red-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-black text-2xl text-red-600 tracking-tight flex items-center gap-2">
                แจ้งเตือนจากระบบ
              </h2>
              <p className="text-[11px] text-red-500/70 font-black uppercase tracking-[0.12em] mt-0.5">
                กรุณาตรวจสอบความถูกต้อง 
              </p>
            </div>
          </div>
          
          {/* ปุ่มปิด */}
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-100 rounded-full transition-all text-slate-400 hover:text-red-600"
          >
            <X size={28} />
          </button>
        </div>

        {/* --- 3. ส่วนเนื้อหา (Content): Scrollable Area --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50 custom-scrollbar">
          
          {/* แสดงจำนวนรายการคร่าวๆ */}
          {errors.length > 0 && (
            <div className="mb-2 px-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
              รายการที่ต้องตรวจสอบ ({errors.length})
            </div>
          )}

          {errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
              <Info size={56} className="mb-4 text-slate-300" />
              <p className="text-lg font-bold text-slate-500 font-sans">ไม่มีรายการแจ้งเตือน</p>
            </div>
          ) : (
            errors.map((msg, idx) => {
              // เช็คเงื่อนไข: ถ้ามีคำว่า Emergency ให้ถือเป็น Warning (สีส้ม) นอกนั้นเป็น Error (สีแดง)
              const isWarning = msg.includes('Emergency')

              return (
                <div 
                  key={idx} 
                  className={`relative border-l-[6px] p-5 rounded-r-2xl shadow-sm transition-all animate-in slide-in-from-right-4 duration-300 ${
                    isWarning 
                      ? 'bg-amber-50 border-amber-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-4 font-sans">
                    <div className="mt-1 shrink-0">
                      {isWarning ? (
                        <AlertTriangle className="text-amber-600" size={20} />
                      ) : (
                        <AlertCircle className="text-red-600" size={20} />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {/* Badge บอกประเภทรายการ */}
                      <span className={`text-[10px] uppercase font-black tracking-widest ${
                        isWarning ? 'text-amber-600/80' : 'text-red-600/80'
                      }`}>
                        {isWarning ? 'Requirement Warning' : 'Validation Error'}
                      </span>

                      <p className={`text-[15px] font-bold leading-snug tracking-tight ${
                        isWarning ? 'text-amber-900' : 'text-red-900'
                      }`}>
                        {msg}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 4. Footer Spacer: ป้องกันรายการสุดท้ายชิดขอบเกินไป */}
        <div className="h-6 bg-white shrink-0 border-t border-slate-50" />
      </div>

      {/* --- CSS สำหรับตกแต่ง Scrollbar --- */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  )
}