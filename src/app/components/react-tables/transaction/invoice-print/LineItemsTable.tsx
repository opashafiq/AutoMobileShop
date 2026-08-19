import React from 'react'
import type { InvoiceDetailsDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

interface LineItemsTableProps {
  details: InvoiceDetailsDto[]
  master: {
    tbim_SubTotal: number
    tbim_SaleTax: number
    tbim_Labour: number
    tbim_DisPer: number
    tbim_DisAmt: number
    tbim_AdjAmt: number
    tbim_Total: number
    tbim_AdjTotal: number
  }
}

const money = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const r2 = (n: number) => Math.round(n * 100) / 100

/** Build human-readable item description from its attributes. */
const itemDescription = (d: InvoiceDetailsDto) =>
  [
    d.tbid_DepartmentName,
    d.tbid_Size,
    d.tbid_Brand,
    d.tbid_Series,
    d.tbid_Bolt,
    d.tbid_HoleS,
    d.tbid_Zone,
  ]
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .join(', ')

/**
 * Line items table with a compact financial summary below.
 * The summary includes: Sub Total, Tax, Labour, Discount, Total, Adjusted Total.
 */
export default function LineItemsTable({ details, master }: LineItemsTableProps) {
  // Compute totals from line items for the summary (authoritative from items)
  const computedSubTotal = r2(details.reduce((sum, d) => sum + (Number(d.tbid_LineTotal) || 0), 0))
  const computedTax = r2(details.reduce((sum, d) => sum + (Number(d.tbid_TaxAmt) || 0), 0))
  const labour = Number(master.tbim_Labour) || 0
  const disPer = Number(master.tbim_DisPer) || 0
  const disAmt = r2((computedSubTotal * disPer) / 100)
  const adjAmt = Number(master.tbim_AdjAmt) || 0
  const total = r2(adjAmt + computedSubTotal + computedTax + labour - disAmt)
  const adjTotal = r2(total + adjAmt)

  return (
    <div className='mb-4 border border-slate-200 rounded-lg overflow-hidden'>
      {/* Table — no overflow-x-auto so columns stay within container */}
      <table className='w-full text-xs' style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className='bg-slate-100 border-b border-slate-200'>
              <th className='px-1.5 py-1.5 text-center font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '4%' }}>
                Tax
              </th>
              <th className='px-1.5 py-1.5 text-right font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '6%' }}>
                Qty
              </th>
              <th className='px-1.5 py-1.5 text-left font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '42%' }}>
                Item Description
              </th>
              <th className='px-1.5 py-1.5 text-left font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '16%' }}>
                Size
              </th>
              <th className='px-1.5 py-1.5 text-left font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '10%' }}>
                Bolt
              </th>
              <th className='px-1.5 py-1.5 text-right font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '11%' }}>
                Unit Price
              </th>
              <th className='px-1.5 py-1.5 text-right font-semibold text-slate-600 uppercase tracking-wider' style={{ width: '11%' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {details.map((item, index) => (
              <tr
                key={item.id || index}
                className={`border-b border-slate-100 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className='px-1.5 py-1.5 text-center'>
                  <span
                    className={`inline-block w-3.5 h-3.5 rounded border ${
                      item.tbid_Taxable
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.tbid_Taxable && (
                      <svg className='w-3.5 h-3.5' viewBox='0 0 14 14' fill='none'>
                        <path
                          d='M3 7l3 3 5-5'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    )}
                  </span>
                </td>
                <td className='px-1.5 py-1.5 text-right text-slate-700 font-medium'>
                  {item.tbid_Qty}
                </td>
                <td className='px-1.5 py-1.5 text-slate-800 truncate' title={itemDescription(item)}>
                  {itemDescription(item)}
                </td>
                <td className='px-1.5 py-1.5 text-slate-600 truncate' title={item.tbid_Size || '-'}>
                  {item.tbid_Size || '-'}
                </td>
                <td className='px-1.5 py-1.5 text-slate-600 truncate' title={item.tbid_Bolt || '-'}>
                  {item.tbid_Bolt || '-'}
                </td>
                <td className='px-1.5 py-1.5 text-right text-slate-700'>
                  ${money(item.tbid_UnitPrice)}
                </td>
                <td className='px-1.5 py-1.5 text-right font-semibold text-slate-900'>
                  ${money(item.tbid_LineTotal)}
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {details.length === 0 && (
              <tr>
                <td colSpan={7} className='px-4 py-6 text-center text-slate-400 text-xs'>
                  No items on this invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>

      {/* Financial Summary (right-aligned) */}
      <div className='border-t border-slate-200 bg-slate-50/80 px-4 py-3'>
        <div className='flex justify-end'>
          <div className='w-64 space-y-1'>
            <SummaryRow label='Sub Total' value={`$${money(computedSubTotal)}`} />
            <SummaryRow label='Tax' value={`$${money(computedTax)}`} />
            {labour > 0 && <SummaryRow label='Labour' value={`$${money(labour)}`} />}
            {disPer > 0 && (
              <SummaryRow
                label={`Discount (${disPer}%)`}
                value={`-$${money(disAmt)}`}
                valueClass='text-red-600'
              />
            )}
            {adjAmt !== 0 && (
              <SummaryRow
                label='Adjustment'
                value={`${adjAmt < 0 ? '-' : '+'}$${money(Math.abs(adjAmt))}`}
                valueClass={adjAmt < 0 ? 'text-red-600' : 'text-emerald-600'}
              />
            )}
            <div className='border-t border-slate-300 pt-1 mt-1'>
              <SummaryRow label='Total' value={`$${money(total)}`} bold />
            </div>
            {adjAmt !== 0 && (
              <SummaryRow label='Adjusted Total' value={`$${money(adjTotal)}`} bold />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
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
