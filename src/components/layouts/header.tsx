'use client'

import { useState } from 'react'
import { LogOut, MessageCircle, ExternalLink, Copy, Check, X, BellRing } from 'lucide-react'
import Link from 'next/link'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'
import { useAuth } from '@/features/auth/context/auth-context'
import { apiFetch } from '@/lib/api-client'

export function Header() {
  const { user, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLineLoading, setIsLineLoading] = useState(false)
  const [lineData, setLineData] = useState<{ addLineUrl: string; token: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConnectClick = async () => {
    setIsModalOpen(true)
    if (!lineData) {
      setIsLineLoading(true)
      try {
        const response = await apiFetch('/api/line/connect', { method: 'PATCH' });
        const data = await response.json();
        
        console.log("🟢 [LineConnect] Data received:", data);
        setLineData(data);

        if (data.addLineUrl) {
          window.open(data.addLineUrl, '_blank');
        }
      } catch (err) {
        console.error("Line connect error:", err);
      } finally {
        setIsLineLoading(false);
      }
    }
  }

  const copyToken = () => {
    if (lineData?.token) {
      navigator.clipboard.writeText(lineData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex h-20 w-full items-center justify-between px-6">
        <Link href="/home">
          <WaneYenLogo size="sm" />
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <button
                onClick={handleConnectClick}
                className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#06C755]"
              >
                <MessageCircle className="size-4" />
                เชื่อมต่อ LINE
              </button>

              <Link href="/profile">
                <div className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer">
                  {user.displayName?.trim() ? user.displayName : "ตั้งชื่อผู้ใช้"}
                </div>
              </Link>
            </>
          )}

          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors">
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* 🟦 Modal Popup แบบเรียบง่าย จัดชิดซ้าย */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            
            {/* Close Button */}
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="size-5" />
            </button>

            <div className="p-8 pt-10 flex flex-col items-start text-left">
              
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">รับแจ้งเตือนผ่าน LINE</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                ผูกบัญชีเพื่อรับแจ้งเตือนเมื่อมีการขอแลกเวร หรือเวรได้รับการอนุมัติ
              </p>

              {isLineLoading ? (
                <div className="flex items-center gap-3 py-4 w-full justify-center">
                  <div className="w-5 h-5 border-2 border-green-100 border-t-[#06C755] rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">กำลังเตรียมข้อมูล...</span>
                </div>
              ) : lineData ? (
                <div className="w-full space-y-7 animate-in fade-in duration-300">
                  
                  {/* Step 1 - สีเข้มขึ้นและชิดซ้าย */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ขั้นตอนที่ 1: เพิ่มเพื่อน</p>
                    <a 
                      href={lineData.addLineUrl} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#06C755] text-white rounded-xl font-bold shadow-md hover:brightness-105 transition-all active:scale-[0.98]"
                    >
                      เพิ่มเพื่อน LINE <ExternalLink className="size-4" />
                    </a>
                  </div>

                  {/* Step 2 - สีเข้มขึ้นและชิดซ้าย */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ขั้นตอนที่ 2: ยืนยันรหัส</p>
                    <div className="relative group">
                      <div className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center px-10">
                        <code className="text-sm font-bold text-slate-700 break-all text-center leading-relaxed">
                          {lineData.token}
                        </code>
                      </div>
                      <button 
                        onClick={copyToken}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white shadow-sm border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-slate-400" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-rose-500 font-medium italic">
                      * คัดลอกรหัสนี้ไปวางในแชท LINE เพื่อลงทะเบียน
                    </p>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}