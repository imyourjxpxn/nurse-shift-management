'use client'
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function ValidationErrorSidebar({ isOpen, onClose, errors }: any) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white z-[10001] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-8 border-t-[8px] border-red-600 border-b bg-red-50/30 flex justify-between items-center">
          <h2 className="font-black text-2xl text-red-600">แจ้งเตือนระบบ</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50 h-[calc(100vh-150px)]">
          {errors.map((msg: string, idx: number) => {
            // 🚩 แยกประเภท: ⚠️ คือ Warning (ส้ม), ❌ คือ Error (แดง)
            const isWarning = msg.includes('⚠️') || msg.includes('Emergency') || msg.includes('MISSING')

            return (
              <div key={idx} className={`border-l-[6px] p-5 rounded-r-2xl shadow-sm ${isWarning ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'}`}>
                <div className="flex items-start gap-4">
                  {isWarning ? <AlertTriangle className="text-amber-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
                  <div>
                    <span className={`text-[10px] font-black uppercase ${isWarning ? 'text-amber-600' : 'text-red-600'}`}>
                      {isWarning ? 'Requirement Warning' : 'Validation Error'}
                    </span>
                    <p className={`text-[15px] font-bold ${isWarning ? 'text-amber-900' : 'text-red-900'}`}>{msg}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}