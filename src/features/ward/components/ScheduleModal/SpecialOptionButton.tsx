//ปุ่มเลือกกรณีพิเศษ (E, Leave, Off)

interface Props {
  label: string;
  isSelected: boolean;
  isBlocked: boolean;
  onClick: () => void;
}

export const SpecialOption = ({ label, isSelected, isBlocked, onClick }: Props) => (
  <button
    disabled={isBlocked}
    onClick={onClick}
    className={`py-3.5 rounded-xl border-2 transition-all font-black text-xs
      ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-50 bg-slate-50 text-slate-500'}
      ${isBlocked ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:border-slate-200'}`}
  >
    {label}
  </button>
);