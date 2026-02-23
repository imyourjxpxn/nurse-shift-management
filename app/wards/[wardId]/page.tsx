'use client'

import { useParams } from 'next/navigation'

export default function WardDetailPage() {
  const params = useParams()
  const wardId = params.wardId

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Ward Detail Page</h1>

      <div className="mt-4 rounded-lg border p-6">
        <p>
          <strong>Ward ID:</strong> {wardId}
        </p>
      </div>

      <p className="mt-6 text-muted-foreground">
        หน้านี้เอาไว้ทำตารางเวรต่อทีหลัง 🔥
      </p>
    </div>
  )
}