interface TimeInputProps {
  label: string
  h: string; m: string
  setH: (v: string) => void; setM: (v: string) => void
  disabled: boolean
}

export function TimeInput({ label, h, m, setH, setM, disabled }: TimeInputProps) {
  const formatBlur = (val: string, setter: (v: string) => void, max: number) => {
    if (!val) { setter('00'); return; }
    let num = Math.min(Math.max(parseInt(val) || 0, 0), max)
    setter(num.toString().padStart(2, '0'))
  }

  return (
    <div className="flex-1">
      <label className="block text-[10px] font-bold mb-1 text-slate-400 uppercase">{label}</label>
      <div className={`flex items-center bg-white border-2 border-slate-200 rounded-2xl px-2 py-1.5 ${disabled ? 'bg-slate-50' : 'focus-within:border-blue-400'}`}>
        <input
          type="text" className="w-full text-center font-bold bg-transparent outline-none"
          value={h} onChange={e => setH(e.target.value.replace(/\D/g, ''))}
          onBlur={() => formatBlur(h, setH, 23)} disabled={disabled} placeholder="00"
        />
        <span className="text-slate-300 mx-1">:</span>
        <input
          type="text" className="w-full text-center font-bold bg-transparent outline-none"
          value={m} onChange={e => setM(e.target.value.replace(/\D/g, ''))}
          onBlur={() => formatBlur(m, setM, 59)} disabled={disabled} placeholder="00"
        />
      </div>
    </div>
  )
}