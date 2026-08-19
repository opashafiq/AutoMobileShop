import React from 'react'
import type { InvoiceMasterDto } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

interface CustomerInfoProps {
  master: InvoiceMasterDto
}

/**
 * Two-column grid showing customer info on the left and vehicle info on the right.
 * Clean label-value pairs for easy scanning.
 */
export default function CustomerInfo({ master }: CustomerInfoProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
      {/* Customer Info */}
      <div className='border border-slate-200 rounded-lg p-3'>
        <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2'>
          Customer Information
        </h3>
        <div className='space-y-1'>
          <InfoRow label='Name' value={master.tbim_Name} />
          {master.tbim_CompanyName && master.tbim_CompanyName !== master.tbim_CompanyAddress && (
            <InfoRow label='Company' value={master.tbim_CompanyName} />
          )}
          <InfoRow label='Address' value={master.tbim_CompanyAddress} />
          <InfoRow label='Phone' value={master.tbim_Phone} />
          <InfoRow label='Email' value={master.tbim_EmailAddress} />
          <InfoRow label='Tax ID' value={master.taxIdentificationNumber || master.tbim_IDNo} />
          <InfoRow label='Tax Company' value={master.taxCompanyName} />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className='border border-slate-200 rounded-lg p-3'>
        <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2'>
          Vehicle Information
        </h3>
        <div className='space-y-1'>
          <InfoRow label='Make' value={master.tbim_VehicleMake} />
          <InfoRow label='Model' value={master.tbim_Model} />
          <InfoRow label='Year' value={master.tbim_Year} />
          <InfoRow label='Odometer' value={master.tbim_Odometer ? `${master.tbim_Odometer} Miles` : ''} />
          <InfoRow label='Tread Depth' value={master.tbim_TreadDepth} />
          <InfoRow label='License Plate' value={master.tbim_License} />
        </div>
      </div>
    </div>
  )
}

/** Reusable label:value row */
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value || String(value).trim() === '') return null
  return (
    <div className='flex gap-2 text-xs'>
      <span className='text-slate-500 min-w-[80px] shrink-0'>{label}:</span>
      <span className='text-slate-800 font-medium'>{value}</span>
    </div>
  )
}
