'use client'

import React from 'react'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, CheckCircle2, PlusCircle } from 'lucide-react'

interface CreateWardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void // เพื่อสั่งให้หน้า Home รีโหลดข้อมูล
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
    const successHappened = !!createdData // เช็คว่ามีการสร้างสำเร็จจริงไหม (มีข้อมูล joinCode มาไหม)
  
    setWardName('')
    setCreatedData(null)
    onOpenChange(false) // สั่งปิด Modal

    // 🔥 จุดสำคัญ: ถ้าสร้างสำเร็จ ให้สั่ง loadDashboardData() ที่หน้า Home ทำงาน
    if (successHappened) {
      onSuccess() 
  }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!createdData ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-left text-xl">สร้างวอร์ดใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="mt-4 space-y-5">
                <Label className="block mb-2 text-sm text-slate-600">
                  ชื่อวอร์ด
                </Label>
                <Input
                  id="wardName"
                  placeholder="เช่น Ward A, กุมารเวชกรรม"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  className="focus-visible:ring-sky-500"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>ยกเลิก</Button>
                <Button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-600" disabled={isSubmitting || !wardName}>
                  {isSubmitting ? 'กำลังสร้าง...' : 'สร้างวอร์ด'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h3 className="mb-1 text-xl font-bold text-slate-800">สร้างวอร์ดสำเร็จ!</h3>
            <p className="mb-6 text-sm text-slate-500">วอร์ด "{createdData.name}" พร้อมใช้งานแล้ว</p>
            
            <div className="w-full space-y-2 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Join Code (รหัสสำหรับพยาบาลในวอร์ด)</p>
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-white p-3 shadow-sm">
                <code className="text-lg font-bold tracking-widest text-sky-600">{createdData.code}</code>
                <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(createdData.code)}>
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            
            <Button className="mt-8 w-full bg-sky-500" onClick={handleClose}>ตกลง</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}