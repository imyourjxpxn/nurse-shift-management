import { useState, useMemo } from 'react'
import { getDaysInMonth, format, startOfMonth } from 'date-fns'
import { th } from 'date-fns/locale'

export function useCalendar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth()) // 0-11
  const [year, setYear] = useState(now.getFullYear())

  // 🚩 สร้าง Date Object ของต้นเดือนนั้นๆ เพื่อใช้เป็น Reference ที่แม่นยำ
  const currentMonthDate = useMemo(() => {
    return new Date(year, month, 1)
  }, [month, year])

  // คำนวณจำนวนวันในเดือนนั้นๆ (เช่น 28, 30, 31)
  const daysInMonth = useMemo(() => {
    return getDaysInMonth(currentMonthDate)
  }, [currentMonthDate])

  // แปลงเลขเดือนเป็นชื่อภาษาไทย (มกราคม, กุมภาพันธ์...)
  const monthName = useMemo(() => {
    return format(currentMonthDate, 'MMMM', { locale: th })
  }, [currentMonthDate])

  // 🚩 เพิ่มฟังก์ชันสำหรับเปลี่ยนเดือนแบบฉลาดๆ (Handle การเปลี่ยนปีให้อัตโนมัติ)
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(prev => prev + 1)
    } else {
      setMonth(prev => prev + 1)
    }
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(prev => prev - 1)
    } else {
      setMonth(prev => prev - 1)
    }
  }

  return {
    month,           // 0-11 (ใช้ใน JS)
    apiMonth: month + 1, // 1-12 (🚩 ใช้ส่งให้ API จะได้ไม่งง)
    year,
    monthName,
    daysInMonth,
    setMonth,
    setYear,
    handleNextMonth, // 🚩 เพิ่มตัวช่วยเปลี่ยนเดือน
    handlePrevMonth  // 🚩 เพิ่มตัวช่วยเปลี่ยนเดือน
  }
}