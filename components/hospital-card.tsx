'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HospitalCardProps {
  hospitalName: string
  onCreateWard?: () => void
}

export function HospitalCard({ hospitalName, onCreateWard }: HospitalCardProps) {
  return (
    <div className="w-full rounded-[24px] bg-sky-100 px-12 py-8 shadow-sm border border-sky-200/50">
      
      <div className="flex flex-col items-start gap-6"> 
        
        <h2 className="text-4xl font-bold text-slate-900">
          {hospitalName}
        </h2>

        {onCreateWard && (
          <Button
            onClick={onCreateWard}
            className="h-12 gap-2 bg-[#00A3FF] px-8 text-white hover:bg-sky-600 rounded-xl shadow-md transition-all active:scale-95 text-base font-medium"
          >
            <Plus className="size-3" />
            สร้างวอร์ด
          </Button>
        )}
        
      </div>
    </div>
  )
}