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
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  // ฟังก์ชันป้องกันการพิมพ์เว้นวรรค: ลบช่องว่างออกทันที
  const handleNameChange = (value: string, setter: (v: string) => void) => {
    const noSpaceValue = value.replace(/\s/g, '')
    setter(noSpaceValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // ส่งค่า firstName และ lastName ที่ผ่านการ trim แล้วไปที่ API
      await updateUser({ 
        firstName: firstName.trim(), 
        lastName: lastName.trim() 
      })
      
      await refreshUser()
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
          ชื่อและนามสกุลที่ระบุจะถูกใช้สำหรับการแสดงผลภายในระบบ
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ช่องกรอกชื่อจริง - ลบ * ออกแล้ว */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-slate-700 font-semibold text-base ml-1">
              ชื่อจริง
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => handleNameChange(e.target.value, setFirstName)}
              placeholder="กรอกชื่อจริง"
              className="h-12 border-slate-200 rounded-2xl focus-visible:ring-sky-500 text-lg px-4"
              disabled={isSubmitting}
            />
          </div>

          {/* ช่องกรอกนามสกุล - ลบ * ออกแล้ว */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-slate-700 font-semibold text-base ml-1">
              นามสกุล
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => handleNameChange(e.target.value, setLastName)}
              placeholder="กรอกนามสกุล"
              className="h-12 border-slate-200 rounded-2xl focus-visible:ring-sky-500 text-lg px-4"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Button 
              type="submit" 
              className="h-12 bg-sky-500 hover:bg-sky-600 rounded-2xl text-base font-bold shadow-lg shadow-sky-100 transition-all active:scale-[0.98]"
              // เอาเงื่อนไข !firstName.trim() || !lastName.trim() ออก เพื่อให้บันทึกค่าว่างได้ถ้าต้องการ
              disabled={isSubmitting}
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