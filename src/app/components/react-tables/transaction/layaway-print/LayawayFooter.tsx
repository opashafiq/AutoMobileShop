import React from 'react'

interface LayawayFooterProps {
  note?: string
  companyName?: string
}

// General tire/wheel safety disclaimer — appears on both invoice and layaway.
// (Kept identical to InvoiceFooter's DEFAULT_TERMS so the wording stays in sync.)
const GENERAL_TERMS =
  "All sales are final. It is customer's responsibility to recheck and retighten lug nuts every 10 miles until tight. Changing your tire/wheel sizes from its original factory size, it's at your own discretion. I have read above statement and the back of this invoice and fully understand it."

// Layaway-specific terms & conditions, numbered 1-6 to match the sample invoice.
// `emphasize` marks the "NO EXCHANGE OR REFUND" line for bold/caps styling.
interface TermItem {
  n: number
  text: string
  emphasize?: boolean
}

const LAYAWAY_TERMS: TermItem[] = [
  {
    n: 1,
    text: 'The merchandise described above is being held and I agree that the amount due will be paid in full and the merchandise will be picked up by me on above mentioned date or it will be returned to stock.',
  },
  {
    n: 2,
    text: 'NO EXCHANGE OR REFUND',
    emphasize: true,
  },
  {
    n: 3,
    text: 'For special order wheels or tires full payment is required prior to order.',
  },
  {
    n: 4,
    text: 'On in house stock 30% advance deposit is required. After that installment must be paid every week, otherwise lay away will be canceled, no refund.',
  },
  {
    n: 5,
    text: 'Present original receipt when making payment.',
  },
  {
    n: 6,
    text: 'I have fully read above mentioned statement and fully understand it.',
  },
]

/**
 * Layaway footer with notes, general safety disclaimer, numbered layaway
 * terms & conditions, and signature line.
 *
 * Text differences vs. the invoice footer (InvoiceFooter):
 *   - Keeps the general "All sales are final…" disclaimer.
 *   - Adds the 6 layaway-specific clauses, numbered to match the sample
 *     layaway invoice (held merchandise, no exchange/refund, deposits,
 *     payment receipt, customer acknowledgement).
 *
 * To edit the wording, change GENERAL_TERMS or the LAYAWAY_TERMS array above.
 */
export default function LayawayFooter({ note, companyName }: LayawayFooterProps) {
  return (
    <div className='space-y-3'>
      {/* Notes section */}
      <div className='border border-slate-200 rounded-lg p-3'>
        <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1'>
          Notes
        </h3>
        <p className='text-xs text-slate-600 min-h-[24px]'>
          {note || ''}
        </p>
      </div>

      {/* General safety disclaimer */}
      <p className='text-[10px] text-slate-500 leading-relaxed'>
        {GENERAL_TERMS}
      </p>

      {/* Numbered layaway terms & conditions */}
      <div className='space-y-1.5'>
        {LAYAWAY_TERMS.map((term) => (
          <div key={term.n} className='flex gap-2'>
            <span className='text-[10px] font-semibold text-slate-700 shrink-0'>
              {term.n}.
            </span>
            <p
              className={
                term.emphasize
                  ? 'text-[11px] font-bold uppercase tracking-wide text-slate-900 leading-relaxed'
                  : 'text-[10px] text-slate-600 leading-relaxed'
              }
            >
              {term.text}
            </p>
          </div>
        ))}
      </div>

      {/* Signature line */}
      <div className='flex items-end gap-4 pt-2'>
        <span className='text-xs font-medium text-slate-600'>Signature:</span>
        <div className='border-b border-slate-400 w-48 h-6' />
      </div>

      {/* Store name watermark */}
      {companyName && (
        <p className='text-[10px] text-slate-400 text-right italic mt-2'>
          {companyName}
        </p>
      )}
    </div>
  )
}
