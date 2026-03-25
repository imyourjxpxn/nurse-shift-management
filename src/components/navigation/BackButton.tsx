'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = "ย้อนกลับ" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center text-slate-400 hover:text-sky-600 mb-10 transition-colors group"
    >
     
      <ArrowLeft className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium text-base">
        {label}
      </span>
    </button>
  )
}