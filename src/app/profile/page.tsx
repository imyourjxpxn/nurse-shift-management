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
  
  // 1. แยก State เป็น firstName และ lastName
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ดึงค่าเริ่มต้นจาก user object มาใส่ในช่อง Input
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      alert('กรุณากรอกทั้งชื่อจริงและนามสกุล')
      return
    }

    try {
      setIsSubmitting(true)

      /**
       * 2. ส่งค่าแยกกันไปที่ updateUser 
       * (หมายเหตุ: อย่าลืมแก้ Interface ของ updateUser ให้รับ { firstName, lastName } ด้วยนะ)
       */
      await updateUser({ 
        displayName: `${firstName.trim()} ${lastName.trim()}` 
      })
      
      await refreshUser()
      alert('บันทึกการเปลี่ยนแปลงสำเร็จ')
      router.back()
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12 flex flex-col items-center">
      <div className="w-full max-w-md">
        <BackButton />

        <h1 className="text-3xl font-bold text-slate-900 mb-2">แก้ไขข้อมูลส่วนตัว</h1>
        <p className="text-sm text-slate-500 mb-10 leading-relaxed">
          ชื่อ-นามสกุลของคุณจะถูกอัปเดตเมื่อกดบันทึกการเปลี่ยนแปลง
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ช่องกรอกชื่อจริง */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-slate-700 font-semibold text-base ml-1">
              ชื่อจริง <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 border-slate-200 rounded-2xl focus-visible:ring-sky-500 text-lg px-4"
              disabled={isSubmitting}
            />
          </div>

          {/* ช่องกรอกนามสกุล */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-slate-700 font-semibold text-base ml-1">
              นามสกุล <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 border-slate-200 rounded-2xl focus-visible:ring-sky-500 text-lg px-4"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Button 
              type="submit" 
              className="h-12 bg-sky-500 hover:bg-sky-600 rounded-2xl text-base font-bold shadow-lg shadow-sky-100 transition-all active:scale-[0.98]"
              disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
            
            <Button 
              type="button" 
              variant="secondary"
              className="h-12 rounded-2xl text-base font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border-none transition-colors"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}