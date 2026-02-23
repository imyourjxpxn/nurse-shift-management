'use client'

import { useParams } from 'next/navigation'

export default function WardPage() {
  const params = useParams()
  const wardId = params.wardId as string

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        🎉 เข้า Ward สำเร็จแล้ว!
      </h1>

      <p className="mt-4">
        Ward ID: {wardId}
      </p>
    </div>
  )
}