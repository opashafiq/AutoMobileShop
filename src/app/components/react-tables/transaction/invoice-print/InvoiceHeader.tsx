import React from 'react'
import type { InvoiceMasterDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'
import { getUserSession } from '@/app/api/auth'

interface InvoiceHeaderProps {
  master: InvoiceMasterDto
}

/**
 * Company header for the invoice print template.
 * Reads location name and address from the logged-in user session
 * (populated at login via fetchUserSession) and falls back to the
 * master record / hardcoded defaults if the session isn't available.
 */
export default function InvoiceHeader({ master }: InvoiceHeaderProps) {
  const session = getUserSession()

  const companyName = session?.locationName || master.tbim_CompanyName || ''
  const address1 = session?.tbld_Address1 || ''
  const address2 = session?.tbld_Address2 || ''

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
          {companyName}
        </h1>
        {address1 && (
          <p className='text-xs text-slate-500 mt-0.5'>
            {address1}
          </p>
        )}
        {address2 && (
          <p className='text-xs text-slate-500'>
            {address2}
          </p>
        )}
        {master.tbim_Phone && (
          <p className='text-xs text-slate-500'>
            Ph: {master.tbim_Phone}
          </p>
        )}
      </div>
    </div>
  )
}
