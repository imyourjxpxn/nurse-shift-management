interface Props {
  schedule: Record<string, string[][]>
}

export function NurseSummaryPanel({ schedule }: Props) {

  const count = (shifts: string[][], type: string) =>
    shifts.flat().filter(s => s === type).length

  return (
    <div className="w-full min-w-[1500px] bg-gray-100 rounded-2xl p-6 space-y-4">

      <h3 className="font-semibold text-gray-700">
        สรุปเวรของพยาบาลแต่ละคนเดือนนี้
      </h3>

      {Object.entries(schedule).map(([id, shifts]) => {
        const morning = count(shifts, 'ช')
        const evening = count(shifts, 'บ')
        const night = count(shifts, 'ด')
        const emergency = count(shifts, 'E')
        const leave = count(shifts, 'ลา')

        const total =
          morning + evening + night + emergency + leave

        return (
          <div
            key={id}
            className="flex justify-between items-center py-3 border-b border-gray-200 text-sm"
          >
            <span>{id}</span>

            <div className="flex gap-6 text-gray-700">
              <span>เวรเช้า : {morning}</span>
              <span>เวรบ่าย : {evening}</span>
              <span>เวรดึก : {night}</span>
              <span>Emergency : {emergency}</span>
              <span>ลา : {leave}</span>
              <span className="font-semibold text-black">
                รวม : {total}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}