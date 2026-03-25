import React from 'react'

export function RoleInfoBox() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <h3 className="mb-2 font-semibold text-foreground">เกี่ยวกับหน้าที่ในระบบ</h3>
      <p className="mb-2 text-sm text-muted-foreground">
        หน้าที่ของคุณในระบบจะถูกกำหนดโดยการกระทำของคุณหลังจากนี้:
      </p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="text-muted-foreground">•</span>
          <span>
            สร้างวอร์ด → คุณจะเป็น <strong className="text-foreground">หัวหน้าพยาบาล</strong> ในระบบ
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-muted-foreground">•</span>
          <span>
            เข้าร่วมวอร์ด → คุณจะเป็น <strong className="text-foreground">พยาบาล</strong> ในระบบ
          </span>
        </li>
      </ul>
    </div>
  )
}