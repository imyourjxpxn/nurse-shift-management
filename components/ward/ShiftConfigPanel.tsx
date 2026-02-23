export function ShiftConfigPanel() {
  return (
    <div className="w-full min-w-[1500px] grid grid-cols-3 gap-6">

      <ShiftCard
        title="เวรเช้า : ช"
        bg="bg-sky-100"
        border="border-sky-300"
      />

      <ShiftCard
        title="เวรบ่าย : บ"
        bg="bg-orange-100"
        border="border-orange-300"
      />

      <ShiftCard
        title="เวรดึก : ด"
        bg="bg-violet-100"
        border="border-violet-300"
      />
    </div>
  )
}

function ShiftCard({
  title,
  bg,
  border,
}: {
  title: string
  bg: string
  border: string
}) {
  return (
    <div className={`${bg} ${border} border rounded-2xl p-5 shadow-sm`}>

      <div className="text-sm font-semibold mb-4">
        {title}
      </div>

      <div className="space-y-4 text-sm">

        <div>
          <label className="block text-xs mb-1 text-gray-600">
            จำนวนพยาบาล
          </label>
          <input
            type="number"
            min="0"
            className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1 text-gray-600">
              เริ่ม
            </label>
            <input
              type="time"
              min="00:00"
              max="23:59"
              className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-gray-600">
              ถึง
            </label>
            <input
              type="time"
              min="00:00"
              max="23:59"
              className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200"
            />
          </div>
        </div>

      </div>
    </div>
  )
}