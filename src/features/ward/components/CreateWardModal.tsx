'use client'

import React from 'react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, CheckCircle2 } from 'lucide-react'

interface CreateWardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void 
  createWardFn: (name: string) => Promise<{ joinCode: string; wardName: string }>
}

export function CreateWardModal({ open, onOpenChange, onSuccess, createWardFn }: CreateWardModalProps) {
  const [wardName, setWardName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdData, setCreatedData] = useState<{ code: string; name: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wardName.trim()) return

    try {
      setIsSubmitting(true)
      const result = await createWardFn(wardName)
      setCreatedData({ code: result.joinCode, name: result.wardName })
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างวอร์ด')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    const successHappened = !!createdData
    setWardName('')
    setCreatedData(null)
    onOpenChange(false)

    if (successHappened) {
      onSuccess() 
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* 🚩 ใช้ gap-0 เพื่อคุมระยะห่างเอง และ p-6 เพื่อความสมดุล */}
      <DialogContent className="sm:max-w-md gap-0 p-6">
        {!createdData ? (
          <>
            <DialogHeader>
              {/* 🚩 leading-none ช่วยให้หัวข้อชิดขอบบรรทัดที่สุด */}
              <DialogTitle className="text-left text-xl font-bold leading-none text-slate-800">
                สร้างวอร์ดใหม่
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wardName" className="text-sm font-medium text-slate-600">
                  ชื่อวอร์ด
                </Label>
                <Input
                  id="wardName"
                  placeholder="เช่น Ward A, กุมารเวชกรรม"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  className="border-sky-200 focus-visible:ring-sky-500"
                  autoComplete="off"
                />
              </div>

              <div className="mt-7 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleClose}
                >
                  ยกเลิก
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-sky-500 text-white transition-colors hover:bg-sky-600 active:bg-sky-700" 
                  disabled={isSubmitting || !wardName}
                >
                  {isSubmitting ? 'กำลังสร้าง...' : 'สร้างวอร์ด'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* 🚩 หน้าแสดงรหัสสำเร็จ (Success State) */
          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h3 className="mb-1 text-xl font-bold text-slate-800">สร้างวอร์ดสำเร็จ!</h3>
            <p className="mb-6 text-sm text-slate-500">วอร์ด "{createdData.name}" พร้อมใช้งานแล้ว</p>
            
            <div className="w-full space-y-2 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                JOIN CODE (รหัสสำหรับพยาบาลในวอร์ด)
              </p>
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-white p-3 shadow-sm">
                <code className="text-lg font-bold tracking-widest text-sky-600">{createdData.code}</code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="hover:bg-sky-50 hover:text-sky-600"
                  onClick={() => navigator.clipboard.writeText(createdData.code)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            
            {/* 🚩 แก้ไข Hover ปุ่มตกลงไม่ให้เป็นสีดำ */}
            <Button 
              className="mt-8 w-full bg-sky-500 text-white shadow-sm transition-colors hover:bg-sky-600 active:bg-sky-700" 
              onClick={handleClose}
            >
              ตกลง
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}