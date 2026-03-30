import { useState, useEffect } from 'react'
import { getWardById } from '@/features/ward/api/getWardById' 
import { getShiftTemplates } from '@/features/ward/api/getAllShiftTemplates'
import { WardDetail, ShiftTemplate } from '@/features/ward/types'

export function useScheduleData(wardId: string, daysInMonth: number, month: number, year: number) {
  const [wardData, setWardData] = useState<WardDetail | null>(null)
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<Record<string, string[][]>>({})

  const fetchData = async () => {
    if (!wardId) return
    try {
      setLoadingData(true)
      
      /**
       * 🚩 แก้ไขจุดนี้: ส่ง year และ month ไปให้ API ตาม Schema ใหม่
       * (หมายเหตุ: ตัวแปร month ที่รับมาเป็น 0-11 จาก useCalendar 
       * จะถูกไปบวก 1 ในฟังก์ชัน getShiftTemplates เองตามที่เราแก้ไว้ก่อนหน้า)
       */
      const [ward, templates] = await Promise.all([
        getWardById(wardId),
        getShiftTemplates(wardId, year, month) 
      ])
      
      setWardData(ward)
      console.log("Templates from Backend:", templates);
      setShiftTemplates(templates || [])
      
      /**
       * 🚩 Mock ข้อมูล (คงเดิมตามคำขอ): 3 Slots ต่อ 1 วัน
       * Slot [0] = เช้า, [1] = บ่าย, [2] = ดึก
       */
      const mockNurses = [
        "นางสาวปรียา วรกุล",
        "นางสาวนพพร สุขใจ",
        "นางสาววิมลรัตน์ ใจดี",
        "นางสาวสมศรี มีสุข"
      ];

      const newSchedule: Record<string, string[][]> = {};
      
      mockNurses.forEach(nurse => {
        // ค่าเริ่มต้นให้เป็นเวรปกติ 3 slots [เช้า, บ่าย, ดึก]
        newSchedule[nurse] = Array.from({ length: daysInMonth }, () => ["", "", ""]);
      });

      // 🚩 วิธี Mock แบบใหม่ให้ UI แสดงผลถูกต้อง:

      // 1. กรณีเวรปกติ (ช, บ, ด) -> ส่ง 3 slots
      if (newSchedule["นางสาวปรียา วรกุล"]) {
        newSchedule["นางสาวปรียา วรกุล"][0] = ["ช", "บ", ""]; // วันที่ 1 ขึ้นเช้า+บ่าย
        newSchedule["นางสาวปรียา วรกุล"][1] = ["", "", "ด"]; // วันที่ 2 ขึ้นดึกช่องเดียว (แต่ยังอยู่ใน 3 slots)
      }

      // 2. กรณีเวรพิเศษ (E, ล, o, off) -> ส่ง slot เดียวก้อนเดียว
      if (newSchedule["นางสาวนพพร สุขใจ"]) {
        newSchedule["นางสาวนพพร สุขใจ"][0] = ["o"]; // วันที่ 1 วันหยุด (Off) -> จะขึ้นตัว 'o' ใหญ่กลางช่อง
        newSchedule["นางสาวนพพร สุขใจ"][1] = ["ล"]; // วันที่ 2 ลา (Leave)
      }

      if (newSchedule["นางสาววิมลรัตน์ ใจดี"]) {
        newSchedule["นางสาววิมลรัตน์ ใจดี"][2] = ["E"]; // วันที่ 3 ฉุกเฉิน (Emergency) -> จะขึ้นตัว 'E' ใหญ่กลางช่อง
      }

      setSchedule(newSchedule);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [wardId, daysInMonth, month, year])

  return { 
    wardData, 
    shiftTemplates, 
    setShiftTemplates, 
    loadingData, 
    error, 
    schedule, 
    setSchedule, 
    refresh: fetchData 
  }
}