'use client'

import { useState } from 'react'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceRefundPicker from '@/app/components/react-tables/transaction/invoice-refund-picker'
import InvoiceRefundForm from '@/app/components/react-tables/transaction/invoice-refund-form'
import type { InvoiceMasterDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'
import { useRouter } from 'next/navigation'

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice-refund', title: 'Invoice Refund' },
  { to: '', title: 'Create' },
]

export default function CreateInvoiceRefundPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'picker' | 'builder'>('picker')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('')
  const [refundMode, setRefundMode] = useState<'item' | 'payment'>('item')

  const handleSelect = (invoice: InvoiceMasterDto, mode: 'item' | 'payment') => {
    setSelectedInvoiceId(String(invoice.id))
    setRefundMode(mode)
    setStage('builder')
  }

  const handleCancel = () => {
    if (stage === 'builder') {
      setStage('picker')
      setSelectedInvoiceId('')
    } else {
      router.push('/react-tables/transaction/invoice-refund')
    }
  }

  return (
    <>
      <BreadcrumbComp title={stage === 'picker' ? 'Create Refund' : refundMode === 'item' ? 'Item Refund' : 'Payment Refund'} items={BCrumb} />
      {stage === 'picker' ? (
        <InvoiceRefundPicker onSelect={handleSelect} onCancel={handleCancel} />
      ) : (
        <InvoiceRefundForm mode='create' sourceInvoiceId={selectedInvoiceId} refundMode={refundMode} onCancel={handleCancel} />
      )}
    </>
  )
}