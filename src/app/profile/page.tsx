'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/auth-context'
import { updateUser } from '@/features/user/api/updateUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/components/navigation/BackButton'

export default function ChangeNamePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ดึงชื่อปัจจุบันมาโชว์ใน Input เมื่อหน้าโหลด
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) return

    try {
      setIsSubmitting(true)

      // 🛑 1. ยิง API ไปที่ Backend (Docker)
      // ฟังก์ชันที่คุณเขียนจะแยก firstName/lastName ให้เองข้างใน
      await updateUser({ displayName })
      
      // 🛑 2. สำคัญมาก: เรียก refreshUser เพื่อดึงข้อมูลล่าสุดจาก DB 
      // มาอัปเดต State ใน Header และ LocalStorage ให้ตรงกัน
      await refreshUser()
      
      alert('บันทึกการเปลี่ยนแปลงสำเร็จ')
      router.back()
    } catch (error: any) {
      // ถ้าไม่ได้เปิด Docker หรือ API พัง จะเด้งมาที่นี่
      alert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12">
      <div className="max-w-[440px] mx-auto">
        <BackButton />

        <h1 className="text-3xl font-bold text-slate-900 mb-2">เปลี่ยนชื่อที่แสดง</h1>
        <p className="text-slate-500 mb-10">ชื่อนี้จะถูกอัปเดตทันทีหลังผู้ใช้ยืนยันการเปลี่ยน</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col">
            <Label htmlFor="displayName" className="mb-3 text-slate-700 font-semibold text-base ml-1">
              ชื่อ-นามสกุล 
            </Label>
            
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="กรอกชื่อและนามสกุลของคุณ"
              className="h-12 border-slate-200 rounded-xl focus-visible:ring-sky-500 text-lg"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              type="submit" 
              className="h-12 bg-sky-500 hover:bg-sky-600 rounded-xl text-base font-bold"
              disabled={isSubmitting || !displayName.trim()}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยนแปลง'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              className="h-12 rounded-xl text-base font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}