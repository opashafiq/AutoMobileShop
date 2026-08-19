import React from 'react'
import type { InvoicePaymentsDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

interface PaymentHistoryProps {
  payments: InvoicePaymentsDto[]
}

const money = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatDate = (value?: string): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Compact payment history table showing all payments received.
 * Displays: sequence number, amount, date, payment type.
 */
export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (!payments || payments.length === 0) return null

  return (
    <div className='border border-slate-200 rounded-lg overflow-hidden'>
      <div className='bg-slate-100 px-3 py-1.5 border-b border-slate-200'>
        <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-500'>
          Payment History
        </h3>
      </div>
      <table className='w-full text-xs'>
        <thead>
          <tr className='border-b border-slate-200 bg-slate-50'>
            <th className='px-3 py-1 text-left font-medium text-slate-500 uppercase tracking-wider w-8'>
              #
            </th>
            <th className='px-3 py-1 text-right font-medium text-slate-500 uppercase tracking-wider'>
              Amount
            </th>
            <th className='px-3 py-1 text-left font-medium text-slate-500 uppercase tracking-wider'>
              Date
            </th>
            <th className='px-3 py-1 text-left font-medium text-slate-500 uppercase tracking-wider'>
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, index) => (
            <tr
              key={p.id || index}
              className={`border-b border-slate-100 last:border-b-0 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              <td className='px-3 py-1.5 text-slate-500 font-medium'>
                {index + 1}
              </td>
              <td className='px-3 py-1.5 text-right font-semibold text-slate-800'>
                ${money(p.tbip_PayAmt)}
              </td>
              <td className='px-3 py-1.5 text-slate-600'>
                {formatDate(p.tbip_Date)}
              </td>
              <td className='px-3 py-1.5 text-slate-600'>
                {p.paymentName || p.tbip_PaymentType || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
