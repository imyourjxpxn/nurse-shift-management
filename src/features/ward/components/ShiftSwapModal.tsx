'use client'

import { useState, useEffect } from 'react'
import { format, getDaysInMonth } from 'date-fns'
import { getAllWardMembers, WardMember } from '@/features/ward/api/getWardmembers'
// นำเข้า useAuth จาก Path ที่ถูกต้องของคุณ
import { useAuth } from '@/features/auth/context/auth-context' 

import { 
  getShiftAssignmentsForSwap, 
  ShiftAssignmentSwapResponse 
} from '@/features/ward/api/getShiftAssignforSwap'

interface Props {
  isOpen: boolean
  onClose: () => void
  wardId: string
  requesterShift: any
  currentYear: number
  currentMonth: number
  onConfirm: (payload: any) => Promise<void>
}

const SHIFT_LABELS: Record<string, string> = {
  morning: 'เวรเช้า',
  afternoon: 'เวรบ่าย',
  night: 'เวรดึก',
  emergency: 'เวร E',
  leave: 'วันลา',
  off: 'วันหยุด'
};

export default function ShiftSwapModal({
  isOpen,
  onClose,
  wardId,
  requesterShift,
  currentYear,
  currentMonth,
  onConfirm,
}: Props) {
  // ดึงข้อมูล User ปัจจุบันที่ Login อยู่จาก Auth Context
  const { user } = useAuth()
  
  const [members, setMembers] = useState<WardMember[]>([])
  const [isPeersLoading, setIsPeersLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [peerShifts, setPeerShifts] = useState<ShiftAssignmentSwapResponse[]>([])
  const [selectedPeerShift, setSelectedPeerShift] = useState<ShiftAssignmentSwapResponse | null>(null)
  const [isLoadingShifts, setIsLoadingShifts] = useState(false)
  const [note, setNote] = useState('')

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1))
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // ตั้งค่าวันที่เริ่มต้นตามเวรที่เลือกมา
  useEffect(() => {
    if (isOpen && requesterShift?.date) {
      const day = new Date(requesterShift.date).getDate()
      setSelectedDay(day)
    }
  }, [isOpen, requesterShift])

  // --- ภาคการกรองสมาชิก (Filter Logic) ---
  useEffect(() => {
    if (isOpen && wardId) {
      setIsPeersLoading(true)
      getAllWardMembers(wardId)
        .then(data => {
          // ใช้ ID จาก useAuth เป็นหลักเพื่อความแม่นยำในการระบุตัวตน "ฉัน"
          const myId = user?.userId;
          
          console.log("🛠️ [Debug] My Auth ID:", myId);

          const eligiblePeers = data.filter(m => {
            // กรอง 1: ต้องไม่ใช่หัวหน้าตึก (Role ต้องเป็น nurse เท่านั้น)
            const isNurse = m.role === 'nurse';
            
            // กรอง 2: ต้องไม่ใช่ตัวเอง (เทียบ userId จาก List กับ myId จาก Auth)
            const isNotMe = myId 
              ? m.userId?.toString() !== myId.toString() 
              : true; 

            return isNurse && isNotMe;
          });

          console.log("✅ [Debug] Members after filter:", eligiblePeers);
          setMembers(eligiblePeers)
        })
        .catch(err => {
          console.error("Failed to load ward members:", err)
        })
        .finally(() => setIsPeersLoading(false))
    }
  }, [isOpen, wardId, user]) // ติดตามสถานะ user เพื่อ Re-filter

  
  // โหลดเวรของพยาบาลคนที่เราเลือกในวันที่ระบุ
  useEffect(() => {
    const fetchShifts = async () => {
      if (!selectedUserId || !isOpen) return
      setIsLoadingShifts(true)
      try {
        const data = await getShiftAssignmentsForSwap(wardId, {
          year: currentYear,
          month: currentMonth,
          day: selectedDay,
          approverUserId: selectedUserId
        })
        setPeerShifts(data)
        setSelectedPeerShift(null) // รีเซ็ตเวรที่เลือกเมื่อเปลี่ยนคนหรือเปลี่ยนวัน
      } catch {
        setPeerShifts([])
      } finally {
        setIsLoadingShifts(false)
      }
    }
    fetchShifts()
  }, [selectedUserId, selectedDay, wardId, currentYear, currentMonth, isOpen])

  const handleConfirm = async () => {
    if (!selectedPeerShift) return;
    
    await onConfirm({
      // ดึง assignment ID จากเวรของเราที่กดมา
      requester_assignment_id: requesterShift.assignmentId || requesterShift.shiftAssignmentId,
      // ID ของเพื่อนที่เราเลือก
      approver_user_id: selectedUserId,
      // ID ของก้อนเวรที่เพื่อนคนนั้นลงไว้
      approver_assignment_id: selectedPeerShift?.approverShiftAssignmentId,
      note,
    })
  }

  if (!isOpen || !requesterShift) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3 border-b flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-800">สร้างคำขอแลกเวร</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* เวรของเรา (แสดงข้อมูลภาษาไทย) */}
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-[11px] text-sky-500 font-medium">เวรของคุณ</p>
              <p className="text-sm font-medium text-slate-700">
                {requesterShift.date ? format(new Date(requesterShift.date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-600 px-3 py-1 rounded-full bg-sky-100">
              {SHIFT_LABELS[requesterShift.type] || requesterShift.shiftName || requesterShift.code}
            </span>
          </div>

          {/* เลือกวันที่ (Dropdown) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">วันที่ต้องการแลก</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 outline-none"
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            >
              {dayOptions.map(d => (
                <option key={d} value={d}>วันที่ {d}</option>
              ))}
            </select>
          </div>

          {/* เลือกรายชื่อพยาบาล (Dropdown) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">เลือกพยาบาล</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 outline-none disabled:bg-slate-50"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isPeersLoading}
            >
              <option value="" disabled hidden>
                {isPeersLoading ? 'กำลังโหลดรายชื่อ...' : 'เลือกพยาบาล'}
              </option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* เลือกเวรของเพื่อนพยาบาลคนนั้น (Dropdown) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">เวรของเพื่อน</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 outline-none disabled:opacity-50"
              value={selectedPeerShift?.approverShiftAssignmentId || ''}
              onChange={(e) => {
                const shift = peerShifts.find(s => s.approverShiftAssignmentId === e.target.value)
                setSelectedPeerShift(shift || null)
              }}
              disabled={isLoadingShifts || !selectedUserId || peerShifts.length === 0}
            >
              <option value="" disabled hidden>
                {isLoadingShifts ? 'กำลังโหลดเวร...' : !selectedUserId ? 'โปรดเลือกพยาบาลก่อน' : peerShifts.length > 0 ? 'เลือกเวร' : 'ไม่มีเวรในวันนี้'}
              </option>
              {peerShifts.map((s) => {
                const typeKey = s.shiftTemplateType || s.shiftAssignmentType || '';
                return (
                  <option key={s.approverShiftAssignmentId} value={s.approverShiftAssignmentId}>
                    {SHIFT_LABELS[typeKey] || typeKey}
                  </option>
                )
              })}
            </select>
          </div>

          {/* ช่องกรอกเหตุผล */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500">เหตุผล</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-sky-400 outline-none"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุเหตุผลในการแลกเวร..."
            />
          </div>
        </div>

        {/* ปุ่มกดยืนยัน/ยกเลิก */}
        <div className="flex gap-2 p-4 border-t bg-slate-50">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-100 transition-colors">
            ยกเลิก
          </button>
          <button
            disabled={!selectedPeerShift || isLoadingShifts}
            onClick={handleConfirm}
            className="flex-1 h-9 rounded-lg text-sm text-white bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 transition-colors"
          >
            {isLoadingShifts ? 'กำลังโหลด...' : 'ยืนยันคำขอ'}
          </button>
        </div>
      </div>
    </div>
  )
}