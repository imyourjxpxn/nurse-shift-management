export function WardDetail() {
  return (
    <div className="w-full min-w-[1500px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

      {/* โรงพยาบาล */}
      <div className="text-sm text-gray-500 mb-2">
        โรงพยาบาล : จันทบุรี
      </div>

      {/* ชื่อวอร์ด + ปุ่มขวา */}
      <div className="flex justify-between items-start">

        {/* LEFT */}
        <div className="space-y-4">

          <h1 className="text-3xl font-bold text-blue-700">
            อายุรกรรมชาย (Med ชาย)
          </h1>

          {/* Code */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Code:
            </label>

            <div className="flex items-center gap-2">
              <input
                value="CodeBRIX36924"
                readOnly
                className="bg-gray-100 px-4 py-2 rounded-xl text-sm border border-gray-200"
              />
              <button className="text-gray-500 hover:text-black">
                📋
              </button>
            </div>
          </div>

          {/* Month / Year */}
          <div className="flex gap-4">

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                เดือน *
              </label>
              <input
                value="มกราคม"
                readOnly
                className="bg-gray-100 px-4 py-2 rounded-xl text-sm border border-gray-200 w-48"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ปี *
              </label>
              <input
                value="2026"
                readOnly
                className="bg-gray-100 px-4 py-2 rounded-xl text-sm border border-gray-200 w-32"
              />
            </div>

          </div>

        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex gap-3">

          <button className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600 transition">
            Swap history
          </button>

          <button className="px-4 py-2 rounded-xl border border-red-500 text-red-500 text-sm hover:bg-red-50 transition">
            Clear
          </button>

          <button className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm hover:bg-green-600 transition">
            Export
          </button>

          <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition">
            💾
          </button>

        </div>

      </div>
    </div>
  )
}