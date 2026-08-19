import React from 'react'

interface FinancialSummaryProps {
  master: {
    tbim_SubTotal: number
    tbim_SaleTax: number
    tbim_Labour: number
    tbim_DisPer: number
    tbim_DisAmt: number
    tbim_Total: number
    tbim_AdjAmt: number
    tbim_AdjTotal: number
    tbim_PaidAmt: number
    tbim_PayInfo: string
  }
}

const money = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/**
 * Displays the full financial breakdown in a compact sidebar layout.
 * Shows: Sub Total, Tax, Labour, Discount, Total, Adjusted Total, Amount Paid, Balance Due.
 */
export default function FinancialSummary({ master }: FinancialSummaryProps) {
  const paid = Number(master.tbim_PaidAmt) || 0
  const total = Number(master.tbim_Total) || 0
  const balance = total - paid

  return (
    <div className='bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5'>
      <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2'>
        Summary
      </h3>

      <Row label='Sub Total' value={`$${money(master.tbim_SubTotal)}`} />
      <Row label='Tax' value={`$${money(master.tbim_SaleTax)}`} />
      {(Number(master.tbim_Labour) || 0) > 0 && (
        <Row label='Labour' value={`$${money(master.tbim_Labour)}`} />
      )}
      {(Number(master.tbim_DisPer) || 0) > 0 && (
        <Row
          label={`Discount (${master.tbim_DisPer}%)`}
          value={`-$${money(master.tbim_DisAmt)}`}
          valueClass='text-red-600'
        />
      )}
      {(Number(master.tbim_AdjAmt) || 0) !== 0 && (
        <Row
          label='Adjustment'
          value={`${(Number(master.tbim_AdjAmt) || 0) < 0 ? '-' : '+'}$${money(Math.abs(Number(master.tbim_AdjAmt) || 0))}`}
          valueClass={(Number(master.tbim_AdjAmt) || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}
        />
      )}

      <div className='border-t border-slate-300 pt-1.5 mt-1.5'>
        <Row label='Total' value={`$${money(total)}`} bold />
      </div>

      {(Number(master.tbim_AdjAmt) || 0) !== 0 && (
        <Row label='Adjusted Total' value={`$${money(master.tbim_AdjTotal || total)}`} bold />
      )}

      <div className='border-t border-slate-300 pt-1.5 mt-1.5'>
        <Row label='Amount Paid' value={`$${money(paid)}`} valueClass='text-emerald-600' />
        {balance > 0 && (
          <Row label='Balance Due' value={`$${money(balance)}`} valueClass='text-red-600' bold />
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string
  value: string
  bold?: boolean
  valueClass?: string
}) {
  return (
    <div className='flex justify-between items-center'>
      <span className={`text-xs ${bold ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
        {label}
      </span>
      <span
        className={`text-xs font-medium ${valueClass || (bold ? 'text-slate-900' : 'text-slate-700')}`}
      >
        {value}
      </span>
    </div>
  )
}
