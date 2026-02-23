'use client'

import { useState } from 'react'

import { WardDetail } from '@/components/ward/WardDetail'
import { ShiftConfigPanel } from '@/components/ward/ShiftConfigPanel'
import { RoleFilterTabs } from '@/components/ward/RoleFilterTabs'
import { ScheduleTable } from '@/components/ward/ScheduleTable'
import { NurseSummaryPanel } from '@/components/ward/NurseSummaryPanel'
import { ShiftSelectModal } from '@/components/modals/ShiftSelectModal'


export type ShiftType = 'ช' | 'บ' | 'ด' | 'E' | 'ลา' | 'Off'
export default function SchedulePage() {
  const [selectedRole, setSelectedRole] = useState<'HEAD' | 'NURSE'>('NURSE')
  const [selectedCell, setSelectedCell] = useState<{
    nurseId: string
    day: number
  } | null>(null)

  const createEmptyMonth = (): ShiftType[][] =>
    Array.from({ length: 31 }, () => [])

  const [schedule, setSchedule] = useState<Record<string, ShiftType[][]>>({
    nurse1: createEmptyMonth(),
    nurse2: createEmptyMonth(),
  })

  const handleSaveShift = (shifts: ShiftType[]) => {
  if (!selectedCell) return

  setSchedule(prev => {
    const newSchedule = { ...prev }

    newSchedule[selectedCell.nurseId] =
      newSchedule[selectedCell.nurseId].map((dayShifts, i) => {
        if (i !== selectedCell.day) return dayShifts
        return shifts.slice(0, 3) // จำกัด 3 เวร
      })

    return newSchedule
  })

  setSelectedCell(null)
}

    return (
      <div className="p-6 space-y-6">
        <WardDetail />

        <ShiftConfigPanel />

        <RoleFilterTabs
          selected={selectedRole}
          onChange={setSelectedRole}
        />

        <ScheduleTable
          schedule={schedule}
          onCellClick={(nurseId, day) =>
            setSelectedCell({ nurseId, day })
          }
        />

        <NurseSummaryPanel schedule={schedule} />

        {selectedCell && (
          <ShiftSelectModal
            onClose={() => setSelectedCell(null)}
            onSelect={handleSaveShift}
          />
        )}
      </div>
    )
  }
