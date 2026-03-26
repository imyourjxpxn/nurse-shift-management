import { 
  History, 
  Trash2, 
  Download, 
  Save, 
  ArrowLeftRight, 
  CheckSquare, 
  Copy,
  ShieldCheck,
  User,
  ChevronDown 
} from 'lucide-react'
import { WardDetail as WardDetailType } from '@/features/ward/types'

interface Props {
  ward: WardDetailType;
  month: string;           // ชื่อเดือนสำหรับแสดงผล
  year: string;            // ปีสำหรับแสดงผล
  currentMonthIdx: number; // Index 0-11
  currentYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// สร้างรายการปี (ย้อนหลัง 1 ปี และล่วงหน้า 3 ปี)
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

export function WardDetail({ 
  ward, 
  month, 
  year, 
  currentMonthIdx, 
  currentYear, 
  onMonthChange, 
  onYearChange 
}: Props) {
  
  const isHeadNurse = ward.userRole === 'head_nurse';

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      
      <div className="text-sm text-slate-400 mb-4 font-medium">
        โรงพยาบาล : {ward.hospitalName}
      </div>

      <div className="flex justify-between items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#1e3a8a] tracking-tight">
              {ward.wardName}
            </h1>
            
            <div className="flex items-center gap-2">
              {isHeadNurse ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                  <ShieldCheck size={14} />
                  หัวหน้าพยาบาล (HEAD)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                  <User size={14} />
                  พยาบาล (NURSE)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Code</label>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl text-sm border border-slate-100 font-mono text-slate-600 h-[42px]">
                {ward.joinCode}
                <button 
                  onClick={() => navigator.clipboard.writeText(ward.joinCode)}
                  className="hover:text-blue-500 transition"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            
            {/* ✅ Dropdown เลือกเดือน */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">เดือน *</label>
              <div className="relative">
                <select 
                  value={currentMonthIdx}
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                  className="appearance-none bg-slate-50 px-4 py-2.5 rounded-2xl text-sm border border-slate-100 w-40 text-slate-600 font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {MONTHS_TH.map((m, index) => (
                    <option key={m} value={index}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* ✅ Dropdown เลือกปี */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ปี *</label>
              <div className="relative">
                <select 
                  value={currentYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="appearance-none bg-slate-50 px-4 py-2.5 rounded-2xl text-sm border border-slate-100 w-28 text-slate-600 font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: ปุ่ม Action */}
        <div className="flex items-center gap-3 pt-4">
          {isHeadNurse ? (
            <>
              <button className="flex items-center gap-2 px-5 py-3 bg-[#2563eb] text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm active:scale-95">
                <History size={18} />
                Swap history
              </button>
              <button className="flex items-center gap-2 px-5 py-3 border border-red-200 text-red-500 rounded-2xl text-sm font-semibold hover:bg-red-50 transition active:scale-95">
                <Trash2 size={18} />
                Clear
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center gap-2 px-5 py-3 bg-[#1a86d9] text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm active:scale-95">
                <ArrowLeftRight size={18} />
                My Swap request
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-[#0b4b9e] text-white rounded-2xl text-sm font-semibold hover:bg-black transition shadow-sm active:scale-95">
                <CheckSquare size={18} />
                My Approve
              </button>
            </>
          )}

          <button className="flex items-center gap-2 px-5 py-3 bg-[#10b981] text-white rounded-2xl text-sm font-semibold hover:bg-green-600 transition shadow-sm active:scale-95">
            <Download size={18} />
            Export
          </button>

          {isHeadNurse && (
            <button className="p-3 border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition active:scale-95 shadow-sm">
              <Save size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}