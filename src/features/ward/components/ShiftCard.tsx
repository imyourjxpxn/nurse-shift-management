import { useEffect, useState } from 'react'
import { TimeInput } from './TimeInput'

export function ShiftCard({ title, bg, border, isEditable, data, defaultStart, defaultEnd }: any) {
  const [required, setRequired] = useState('')
  const [startH, setStartH] = useState('00'); const [startM, setStartM] = useState('00')
  const [endH, setEndH] = useState('00'); const [endM, setEndM] = useState('00')

  useEffect(() => {
    const parse = (t: string) => ({ h: t.split(':')[0] || '00', m: t.split(':')[1] || '00' })
    const s = parse(data?.startTime || defaultStart)
    const e = parse(data?.endTime || defaultEnd)
    
    setRequired(data?.requiredPeople?.toString() || '')
    setStartH(s.h); setStartM(s.m); setEndH(e.h); setEndM(e.m)
  }, [data])

  return (
    <div className={`${bg} ${border} border-2 rounded-3xl p-6 shadow-sm`}>
      <h3 className="text-base font-black text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold mb-1 text-slate-400 uppercase">จำนวนพยาบาล</label>
          <input
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-2 text-lg font-bold outline-none focus:border-blue-400 disabled:bg-slate-50"
            value={required} onChange={e => setRequired(e.target.value.replace(/\D/g, ''))}
            disabled={!isEditable} placeholder="ระบุจำนวน"
          />
        </div>
        <div className="flex gap-4">
          <TimeInput label="เริ่ม" h={startH} m={startM} setH={setStartH} setM={setStartM} disabled={!isEditable} />
          <TimeInput label="ถึง" h={endH} m={endM} setH={setEndH} setM={setEndM} disabled={!isEditable} />
        </div>
      </div>
    </div>
  )
}