import React from 'react'
import type { InvoiceMasterDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

interface InvoiceMetaProps {
  master: InvoiceMasterDto
}

const formatDate = (value?: string): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const PAY_LABEL: Record<string, string> = {
  F: 'Full Payment',
  P: 'Partial Payment',
  L: 'Pending',
}

/**
 * Transaction metadata row: Invoice #, Date, Payment Status.
 * Displays as a clean horizontal bar beneath the header.
 */
export default function InvoiceMeta({ master }: InvoiceMetaProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 mb-4 px-1'>
      {/* Invoice number */}
      <div className='flex items-center gap-2'>
        <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
          Invoice
        </span>
        <span className='text-sm font-bold text-slate-900'>
          #{master.tbim_InvoiceIdRad || master.id}
        </span>
      </div>

      {/* Date */}
      <div className='flex items-center gap-2'>
        <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
          Date
        </span>
        <span className='text-sm text-slate-700'>
          {formatDate(master.tbim_InvDate)}
        </span>
      </div>

      {/* Payment status */}
      <div className='flex items-center gap-2'>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            master.tbim_PayInfo === 'F'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : master.tbim_PayInfo === 'P'
                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
          }`}
        >
          {PAY_LABEL[master.tbim_PayInfo] || master.tbim_PayInfo || 'N/A'}
        </span>
      </div>
    </div>
  )
}
