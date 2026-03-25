'use client'

import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { WaneYenLogo } from '@/components/logo/waneyen-logo'

import { LegalContentModal } from '@/features/auth/components/legal-content-modal'
import { TermsOfServiceContent, PrivacyPolicyContent } from '@/features/auth/components/legal-content'
import { RoleInfoBox } from '@/features/auth/components/role-info-box'
import { LegalCheckboxGroup } from '@/features/auth/components/legal-checkbox-group'
import { RegisterFormFields } from '@/features/auth/components/register-form-fields'

import { useAuth } from '@/features/auth/context/auth-context'
import { getHospitals, type Hospital } from '@/features/Hospital/api/getHospital'

export default function RegisterPage() {
  const router = useRouter()
  const { user, isLoading, completeRegistration } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace("/login"); return }
    if (user.profileCompleted) { router.replace("/home") }

    getHospitals().then(setHospitals).catch(console.error)
  }, [user, isLoading, router])

  const isFormValid = firstName.trim() && lastName.trim() && selectedHospital && acceptedTerms && acceptedPrivacy

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !user || isSubmitting) return
    try {
      setIsSubmitting(true)
      await completeRegistration({
        userId: user.userId,
        firstName,
        lastName,
        hospitalId: selectedHospital.hospitalId,
      })
      router.replace("/home")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) return null

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-sky-600 hover:underline">
          <ArrowLeft className="size-4" /> ย้อนกลับ
        </Link>

        <div className="flex flex-col items-center gap-6">
          <WaneYenLogo size="lg" />
          <div className="w-full">
            <h1 className="mb-2 text-2xl font-bold text-foreground">ลงทะเบียนผู้ใช้ใหม่</h1>
            <p className="text-muted-foreground">กรุณากรอกข้อมูลของคุณเพื่อทำการลงทะเบียน</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">อีเมล</Label>
              <Input value={user?.email || ''} disabled className="bg-muted/50" />
            </div>

            <RegisterFormFields 
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              hospitals={hospitals}
              selectedHospitalId={selectedHospital?.hospitalId ?? ""}
              onHospitalChange={(id) => setSelectedHospital(hospitals.find(h => h.hospitalId === id) || null)}
            />

            <RoleInfoBox />

            <LegalCheckboxGroup 
              acceptedTerms={acceptedTerms}
              acceptedPrivacy={acceptedPrivacy}
              onOpenTerms={() => setTermsModalOpen(true)}
              onOpenPrivacy={() => setPrivacyModalOpen(true)}
            />

            <Button type="submit" disabled={!isFormValid || isSubmitting} className="h-12 w-full bg-sky-400 text-white hover:bg-sky-500">
              ยืนยันการลงทะเบียน
            </Button>
          </form>
        </div>
      </div>

      <LegalContentModal open={termsModalOpen} onOpenChange={setTermsModalOpen} title="Terms of Service" onAccept={() => setAcceptedTerms(true)}>
        <TermsOfServiceContent />
      </LegalContentModal>

      <LegalContentModal open={privacyModalOpen} onOpenChange={setPrivacyModalOpen} title="Privacy Policy (PDPA)" onAccept={() => setAcceptedPrivacy(true)}>
        <PrivacyPolicyContent />
      </LegalContentModal>
    </main>
  )
}