'use client'

import { Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Ward } from '@/features/ward/types'

interface WardListItemProps {
  ward: Ward
  isHeadNurse: boolean
  onEnterWard: (ward: Ward) => void
  onDeleteWard: (ward: Ward) => void
}

export function WardListItem({
  ward,
  isHeadNurse,
  onEnterWard,
  onDeleteWard,
}: WardListItemProps) {

  
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition">
      <div>
        {/* ✅ id + ward name แถวเดียว */}
        <h3 className="font-semibold text-foreground">
          {ward.wardId} - {ward.wardName}
        </h3>

        {/* ✅ จำนวนสมาชิก */}
        <p className="text-sm text-sky-500">
          {ward.member} สมาชิก
        </p>

        {/* ✅ ผู้สร้าง */}
        <p className="text-sm text-muted-foreground">
          สร้างโดย {ward.createdBy}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          onClick={() => onEnterWard(ward)}
        >
          <Users className="size-4" />
          เข้าสู่วอร์ด
        </Button>

        {isHeadNurse && (
          <Button
            variant="outline"
            size="icon"
            className="size-9 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
            onClick={() => onDeleteWard(ward)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}