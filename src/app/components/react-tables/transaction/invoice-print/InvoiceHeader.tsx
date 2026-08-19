import React from 'react'
import type { InvoiceMasterDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

interface InvoiceHeaderProps {
  master: InvoiceMasterDto
}

/**
 * Company header for the invoice print template.
 * Displays the business name, address, and phone in a clean, branded layout.
 *
 * To add a logo: place an <img> tag above the company name.
 * To change brand colors: edit the Tailwind classes on the accent bar.
 */
export default function InvoiceHeader({ master }: InvoiceHeaderProps) {
  return (
    <div className='mb-4'>
      {/* Subtle accent bar */}
      <div className='h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg' />

      <div className='bg-slate-50 border border-slate-200 border-t-0 rounded-b-lg px-5 py-4 text-center'>
        {/* === LOGO PLACEHOLDER ===
            Replace this comment with your logo:
            <img src="/images/logo.png" alt="Company Logo" className="h-12 mx-auto mb-2" />
        */}
        <h1 className='text-xl font-bold text-slate-900 tracking-tight'>
          {master.tbim_CompanyName || 'Apollo Tire & Wheel'}
        </h1>
        <p className='text-xs text-slate-500 mt-0.5'>
          {master.tbim_CompanyAddress || '3722 NASA Road 1, Seabrook, TX 77586'}
        </p>
        {master.tbim_Phone && (
          <p className='text-xs text-slate-500'>
            Ph: {master.tbim_Phone}
          </p>
        )}
      </div>
    </div>
  )
}
