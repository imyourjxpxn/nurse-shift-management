'use client'

interface TimeInputProps {
  label: string
  h: string
  m: string
  setH: (v: string) => void
  setM: (v: string) => void
  disabled: boolean
  hasError?: boolean
}

export function TimeInput({ label, h, m, setH, setM, disabled, hasError }: TimeInputProps) {
  
  // 🚩 ฟังก์ชันจัดการการพิมพ์ (Real-time Format)
  const handleChange = (val: string, setter: (v: string) => void, max: number) => {
    const numOnly = val.replace(/\D/g, ''); // รับแค่ตัวเลข
    
    if (numOnly === '') {
      setter(''); // ยอมให้เป็นค่าว่างชั่วคราวตอนกำลังพิมพ์
      return;
    }

    // 💡 Logic: ถ้าพิมพ์ตัวเลขตัวแรก แล้วมัน 'เกิน' หลักแรกที่เป็นไปได้
    // เช่น ชั่วโมง พิมพ์ 3 (ไม่มี 30-39 น.) หรือ นาที พิมพ์ 6 (ไม่มี 60-69 นาที)
    // ให้เติม 0 ข้างหน้าให้ทันที (Auto-prefix)
    const firstDigitMax = Math.floor(max / 10);
    if (numOnly.length === 1 && parseInt(numOnly) > firstDigitMax) {
      setter(`0${numOnly}`);
    } else {
      setter(numOnly.slice(0, 2)); // เอาแค่ 2 หลัก
    }
  }

  const handleFocus = (val: string, setter: (v: string) => void) => {
    if (val === '--') {
      setter('') 
    }
  }

  const formatBlur = (val: string, setter: (v: string) => void, max: number) => {
    if (!val || val === '') { 
      setter('--'); 
      return; 
    }
    // ถ้าพิมพ์ค้างไว้หลักเดียว เช่น "5" แล้วเลิกพิมพ์ ให้กลายเป็น "05"
    let num = Math.min(Math.max(parseInt(val) || 0, 0), max)
    setter(num.toString().padStart(2, '0'))
  }

  return (
    <div className="flex-1">
      <label className="block text-[10px] font-bold mb-1 text-slate-400 uppercase tracking-tight">
        {label}
      </label>
      
      <div className={`
        flex items-center bg-white border-2 rounded-2xl px-2 py-1.5 transition-all
        ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 
          hasError ? 'border-red-200 bg-red-50' : 'border-slate-200 focus-within:border-blue-400 shadow-sm'}
      `}>
        {/* ช่องชั่วโมง */}
        <input
          type="text" 
          inputMode="numeric" // 📱 ช่วยให้มือถือขึ้นแป้นตัวเลข
          className="w-full text-center font-bold bg-transparent outline-none text-slate-700 disabled:cursor-not-allowed"
          value={h} 
          // 🚩 เปลี่ยน onChange มาใช้ handleChange ของเรา
          onChange={e => handleChange(e.target.value, setH, 23)}
          onFocus={() => handleFocus(h, setH)} 
          onBlur={() => formatBlur(h, setH, 23)} 
          disabled={disabled} 
          placeholder="--"
        />
        
        <span className={`${h === '--' && m === '--' ? 'text-slate-300' : 'text-slate-400'} mx-0.5 font-bold`}>:</span>
        
        {/* ช่องนาที */}
        <input
          type="text" 
          inputMode="numeric"
          className="w-full text-center font-bold bg-transparent outline-none text-slate-700 disabled:cursor-not-allowed"
          value={m} 
          // 🚩 เปลี่ยน onChange มาใช้ handleChange ของเรา
          onChange={e => handleChange(e.target.value, setM, 59)}
          onFocus={() => handleFocus(m, setM)} 
          onBlur={() => formatBlur(m, setM, 59)} 
          disabled={disabled} 
          placeholder="--"
        />
      </div>
    </div>
  )
}