'use client'

import { HospitalCard } from '@/features/Hospital/components/hospital-card'
import { WardListItem } from '@/features/ward/components/WardItemList'
import { CreateWardModal } from '@/features/ward/components/CreateWardModal'
import { JoinWardModal } from '@/features/ward/components/openJoinModal'
import { useDashboard } from '@/features/ward/hooks/useDashboard'
import { createWard } from '@/features/ward/api/CreateWard'

export default function HomePage() {
  const {
    user, isAuthLoading, hospitalInfo, wards, isDataLoading,
    selectedWard, isJoinOpen, setIsJoinOpen, 
    isCreateOpen, setIsCreateOpen,
    loadDashboardData, handleEnterWard, handleJoinWardAction
  } = useDashboard()

  if (isAuthLoading || isDataLoading) {
    return <div className="p-20 text-center">Loading Dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-white p-8">

      
      {/*Hospital Card*/}
      <div className="mb-8">
        <HospitalCard 
          hospitalName={hospitalInfo?.name || '...'} 
          onCreateWard={() => setIsCreateOpen(true)} 
        />
      </div>

      {/* Ward List */}
      <div className="mt-4 bg-slate-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">
          รายการวอร์ดของคุณ
        </h2>

        <div className="space-y-4">
          {wards.map((ward) => (
            <WardListItem
              key={ward.wardId}
              ward={ward}
              isHeadNurse={ward.createdBy === user?.userId}
              onEnterWard={handleEnterWard}
              onDeleteWard={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateWardModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={loadDashboardData}
        createWardFn={createWard}
      />

      <JoinWardModal
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        wardName={selectedWard?.wardName || ''}
        onJoinWard={handleJoinWardAction}
      />
    </div>
  )
}