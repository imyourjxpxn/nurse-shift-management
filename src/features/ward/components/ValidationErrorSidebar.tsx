'use client'

import { X, AlertCircle, Info } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  errors: string[]
}

export function ValidationErrorSidebar({ isOpen, onClose, errors }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000]" 
          onClick={onClose} 
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 z-[10001] transform transition-transform duration-300 ease-in-out p-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={28} />
            <h2 className="font-bold text-2xl text-slate-800 tracking-tight">แจ้งเตือนระบบ</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={28} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-4 overflow-y-auto h-[calc(100vh-100px)]">
          {errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
              <Info size={48} className="mb-4" />
              <p className="text-lg font-bold text-slate-500">ไม่มีรายการแจ้งเตือน</p>
            </div>
          ) : (
            errors.map((msg, idx) => (
              <div 
                key={idx} 
                className="bg-red-50 border-l-[6px] border-red-500 p-6 rounded-r-xl"
              >
                <div className="flex items-start">
                  <p className="text-[18px] font-bold text-red-900 leading-normal">
                    {msg}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}