//ปุ่มเลือกเวร (Morning, Afternoon, Night) ที่มี Logic การ Disable ในตัว

interface Props {
  type: string;
  label: string;
  timeRange: string;
  isSelected: boolean;
  isBlocked: boolean;
  onClick: () => void;
}

export const ShiftOption = ({ label, timeRange, isSelected, isBlocked, onClick }: Props) => (
  <button
    disabled={isBlocked}
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all
      ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-50 bg-slate-50'}
      ${isBlocked ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:border-slate-200'}`}
  >
    <div className="flex flex-col items-start">
      <span className={`text-base font-black ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{label}</span>
      {isSelected && <span className="text-[9px] text-blue-500 font-bold">เลือกแล้ว</span>}
    </div>
    <span className="text-sm font-bold text-slate-400">{timeRange}</span>
  </button>
);