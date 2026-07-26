'use client'

import { useState } from 'react'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayRefundPicker from '@/app/components/react-tables/transaction/layaway-refund-picker'
import LayawayRefundForm from '@/app/components/react-tables/transaction/layaway-refund-form'
import type { LayawayMasterDto } from '@/app/(DashboardLayout)/types/apps/layawayMaster'
import { useRouter } from 'next/navigation'

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway-refund', title: 'Layaway Refund' },
  { to: '', title: 'Create' },
]

export default function CreateLayawayRefundPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'picker' | 'builder'>('picker')
  const [selectedLayawayId, setSelectedLayawayId] = useState<string>('')
  const [refundMode, setRefundMode] = useState<'item' | 'payment'>('item')

  const handleSelect = (layaway: LayawayMasterDto, mode: 'item' | 'payment') => {
    setSelectedLayawayId(String(layaway.id))
    setRefundMode(mode)
    setStage('builder')
  }

  const handleCancel = () => {
    if (stage === 'builder') {
      setStage('picker')
      setSelectedLayawayId('')
    } else {
      router.push('/react-tables/transaction/layaway-refund')
    }
  }

  return (
    <>
      <BreadcrumbComp title={stage === 'picker' ? 'Create Layaway Refund' : refundMode === 'item' ? 'Item Refund' : 'Payment Refund'} items={BCrumb} />
      {stage === 'picker' ? (
        <LayawayRefundPicker onSelect={handleSelect} onCancel={handleCancel} />
      ) : (
        <LayawayRefundForm mode='create' sourceLayawayId={selectedLayawayId} refundMode={refundMode} onCancel={handleCancel} />
      )}
    </>
  )
}
