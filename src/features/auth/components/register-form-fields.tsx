import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input' // แก้จาก UIInput เป็น Input ธรรมดาเพื่อความง่าย
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Hospital } from '@/features/Hospital/api/getHospital'

interface RegisterFormFieldsProps {
  firstName: string
  setFirstName: (val: string) => void
  lastName: string
  setLastName: (val: string) => void
  hospitals: Hospital[]
  selectedHospitalId: string
  onHospitalChange: (id: string) => void
}

export function RegisterFormFields({
  firstName, setFirstName,
  lastName, setLastName,
  hospitals,
  selectedHospitalId,
  onHospitalChange
}: RegisterFormFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Full Name (Connected Fields) */}
      <div className="flex rounded-md border border-sky-300 focus-within:ring-2 focus-within:ring-sky-500/30 focus-within:border-sky-500 overflow-hidden">
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="ชื่อจริง"
          className="flex-1 rounded-none border-0 focus-visible:ring-0"
        />
        <div className="w-px bg-sky-300" />
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="นามสกุล"
          className="flex-1 rounded-none border-0 focus-visible:ring-0"
        />
      </div>

      {/* Hospital Select */}
      <div className="space-y-2">
        <Label className="text-sm text-sky-600">
          โรงพยาบาล <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedHospitalId} onValueChange={onHospitalChange}>
          <SelectTrigger className="w-full border-border">
            <SelectValue placeholder="เลือกโรงพยาบาล" />
          </SelectTrigger>
          <SelectContent>
            {hospitals.map((h) => (
              <SelectItem key={h.hospitalId} value={h.hospitalId}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}