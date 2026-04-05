'use client'

import { useState, useEffect } from 'react'
import { format, getDaysInMonth } from 'date-fns'
import { useAuth } from '@/features/auth/context/auth-context' 
import { getAllWardMembers, WardMember } from '@/features/ward/api/getWardmembers'
import { getShiftAssignmentsForSwap, ShiftAssignmentSwapResponse } from '@/features/ward/api/getShiftAssignforSwap'
import { createShiftSwapRequest } from '@/features/ward/api/createShiftSwapRequest'

interface Props {
  isOpen: boolean
  onClose: () => void
  wardId: string
  requesterShift: any
  currentYear: number
  currentMonth: number
  onConfirm: () => void 
}

const SHIFT_LABELS: Record<string, string> = {
  morning: 'เวรเช้า', afternoon: 'เวรบ่าย', night: 'เวรดึก', emergency: 'เวร E', leave: 'วันลา', off: 'วันหยุด'
};

export default function ShiftSwapModal({
  isOpen, onClose, wardId, requesterShift, currentYear, currentMonth, onConfirm
}: Props) {
  const { user } = useAuth()
  
  // --- States ---
  const [members, setMembers] = useState<WardMember[]>([])
  const [isPeersLoading, setIsPeersLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [peerShifts, setPeerShifts] = useState<ShiftAssignmentSwapResponse[]>([])
  const [selectedPeerShift, setSelectedPeerShift] = useState<ShiftAssignmentSwapResponse | null>(null)
  const [isLoadingShifts, setIsLoadingShifts] = useState(false)
  const [note, setNote] = useState('')

  // --- Error & Submitting States ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1))
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Reset error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (requesterShift?.date) {
        setSelectedDay(new Date(requesterShift.date).getDate());
      }
    }
  }, [isOpen, requesterShift]);

  // Load Members
  useEffect(() => {
    if (isOpen && wardId) {
      setIsPeersLoading(true)
      getAllWardMembers(wardId).then(data => {
        const eligible = data.filter(m => m.role === 'nurse' && m.userId !== user?.userId);
        setMembers(eligible)
      }).finally(() => setIsPeersLoading(false))
    }
  }, [isOpen, wardId, user]);

  // Load Peer Shifts
  useEffect(() => {
    if (!selectedUserId || !isOpen) return
    setIsLoadingShifts(true)
    getShiftAssignmentsForSwap(wardId, {
      year: currentYear, month: currentMonth, day: selectedDay, approverUserId: selectedUserId
    }).then(data => {
      setPeerShifts(data);
      setSelectedPeerShift(null);
    }).finally(() => setIsLoadingShifts(false))
  }, [selectedUserId, selectedDay, isOpen]);

  // --- Submit Handler ---
  const handleConfirm = async () => {
    if (!selectedUserId) return setError('โปรดเลือกพยาบาลที่ต้องการแลกด้วย');
    if (!selectedPeerShift) return setError('โปรดเลือกเวรของเพื่อนที่จะแลก');

    setError(null);
    setIsSubmitting(true);

    // 🚩 [CRITICAL FIX] ปรับชื่อ Key ให้เป็น camelCase ตาม Backend Postman
    const payload = {
      approverUserId: selectedUserId,
      requesterAssignmentId: requesterShift.assignmentId || requesterShift.shiftAssignmentId,
      approverAssignmentId: selectedPeerShift.approverShiftAssignmentId,
      note: note.trim() || null
    };

    console.log("%c🚀 [ShiftSwap] Sending Payload (Fixed):", "color: #0ea5e9; font-weight: bold;", payload);

    try {
      const response = await createShiftSwapRequest(payload);
      console.log("%c✅ [ShiftSwap] Success Response:", "color: #10b981; font-weight: bold;", response);
      
      onConfirm(); 
      onClose();
    } catch (err: any) {
      console.error("%c❌ [ShiftSwap] Failed Error:", "color: #ef4444; font-weight: bold;", err);
      // แสดง Error text สีแดงเรียบๆ ใน Modal
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen || !requesterShift) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800">สร้างคำขอแลกเวร</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* User's Original Shift Details */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
            <div className="space-y-0.5">
              <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">เวรของคุณ</p>
              <p className="text-sm font-bold text-slate-700">
                {requesterShift.date ? format(new Date(requesterShift.date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
            <span className="bg-white px-3 py-1.5 rounded-xl text-xs font-black text-sky-600 border border-sky-50 shadow-sm">
              {SHIFT_LABELS[requesterShift.type] || SHIFT_LABELS[requesterShift.templateType] || requesterShift.shiftName || 'เวร'}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Step 1: Select Day */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">วันที่ต้องการแลก</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all cursor-pointer"
                value={selectedDay} 
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              >
                {dayOptions.map(d => (
                  <option key={d} value={d}>วันที่ {d} {format(new Date(currentYear, currentMonth - 1), 'MMMM')}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Peer Nurse */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">เลือกพยาบาล</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all cursor-pointer disabled:opacity-50"
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isPeersLoading}
              >
                <option value="" disabled hidden>{isPeersLoading ? 'กำลังโหลด...' : 'เลือกเพื่อนพยาบาล'}</option>
                {members.map(m => <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>

            {/* Step 3: Select Peer's Shift */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">เวรของเพื่อนในวันนั้น</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all cursor-pointer disabled:opacity-50"
                value={selectedPeerShift?.approverShiftAssignmentId || ''}
                onChange={(e) => setSelectedPeerShift(peerShifts.find(s => s.approverShiftAssignmentId === e.target.value) || null)}
                disabled={isLoadingShifts || !selectedUserId || peerShifts.length === 0}
              >
                <option value="" disabled hidden>
                  {isLoadingShifts ? 'กำลังค้นหา...' : !selectedUserId ? 'โปรดเลือกเพื่อนพยาบาลก่อน' : peerShifts.length > 0 ? 'เลือกเวรที่จะแลก' : 'ไม่พบเวรในวันนี้'}
                </option>
                {peerShifts.map(s => (
                  <option key={s.approverShiftAssignmentId} value={s.approverShiftAssignmentId}>
                    {SHIFT_LABELS[s.shiftTemplateType || ''] || s.shiftAssignmentType}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">เหตุผลเพิ่มเติม</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none resize-none transition-all"
                rows={2} 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="ระบุเหตุผล (ไม่บังคับ)..." 
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
          
          {/* 🚩 Error Message (Minimal Red Text) */}
          {error && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <p className="text-[13px] font-bold text-rose-600 text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl font-bold text-sm bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={isSubmitting || !selectedPeerShift} 
              className="flex-1 py-4 rounded-2xl font-bold text-sm bg-sky-500 text-white hover:bg-sky-600 disabled:bg-slate-300 shadow-lg shadow-sky-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังส่ง...
                </>
              ) : 'ยืนยันคำขอ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}