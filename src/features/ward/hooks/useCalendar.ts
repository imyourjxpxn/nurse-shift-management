import { useState, useMemo } from 'react'
import { getDaysInMonth, format } from 'date-fns'
import { th } from 'date-fns/locale'

export function useCalendar() {
  const [month, setMonth] = useState(new Date().getMonth()) // 0-11
  const [year, setYear] = useState(new Date().getFullYear())

  // คำนวณจำนวนวันในเดือนนั้นๆ (เช่น 28, 30, 31)
  const daysInMonth = useMemo(() => {
    return getDaysInMonth(new Date(year, month))
  }, [month, year])

  // แปลงเลขเดือนเป็นชื่อภาษาไทย (มกราคม, กุมภาพันธ์...)
  const monthName = useMemo(() => {
    return format(new Date(year, month), 'MMMM', { locale: th })
  }, [month, year])

  return {
    month,
    year,
    monthName,
    daysInMonth,
    setMonth,
    setYear
  }
}