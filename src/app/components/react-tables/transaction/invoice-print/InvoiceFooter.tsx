import React from 'react'

interface InvoiceFooterProps {
  note?: string
  companyName?: string
}

const DEFAULT_TERMS =
  "All sales are final. It is the customer's responsibility to recheck and retighten lug nuts every 10 miles until tight. Changing your tire/wheel sizes from its original factory size is at your own discretion. I have read the above statement and the back of this invoice and fully understand it."

/**
 * Invoice footer with optional notes, legal terms, and signature line.
 * Matches the structure of the original dot-matrix invoice footer.
 */
export default function InvoiceFooter({ note, companyName }: InvoiceFooterProps) {
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

      {/* Terms & conditions */}
      <p className='text-[10px] text-slate-500 leading-relaxed'>{DEFAULT_TERMS}</p>

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
