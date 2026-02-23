'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HospitalCardProps {
  hospitalName: string
  onCreateWard?: () => void
}

export function HospitalCard({
  hospitalName,
  onCreateWard,
}: HospitalCardProps) {
  return (
    <div className="rounded-2xl bg-sky-100 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {hospitalName}
        </h2>

        {onCreateWard && (
          <Button
            onClick={onCreateWard}
            className="gap-2 bg-sky-500 text-white hover:bg-sky-600"
          >
            <Plus className="size-4" />
            สร้างวอร์ด
          </Button>
        )}
      </div>
    </div>
  )
}