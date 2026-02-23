interface Props {
  selected: 'HEAD' | 'NURSE'
  onChange: (r: 'HEAD' | 'NURSE') => void
}

export function RoleFilterTabs({ selected, onChange }: Props) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange('HEAD')}
        className={`px-4 py-2 rounded-lg ${
          selected === 'HEAD'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200'
        }`}
      >
        Head Nurse
      </button>

      <button
        onClick={() => onChange('NURSE')}
        className={`px-4 py-2 rounded-lg ${
          selected === 'NURSE'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200'
        }`}
      >
        Nurse
      </button>
    </div>
  )
}