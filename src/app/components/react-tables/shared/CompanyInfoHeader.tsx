'use client'

import React from 'react'
import useSWR from 'swr'
import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'

/**
 * Company information fetched from api/CompanyInfo/WOLogo
 */
interface CompanyInfo {
  id: number
  tbbiBusinessName: string
  tbbi_Address1: string
  tbbi_Address2: string
  [key: string]: unknown
}

interface CompanyInfoHeaderProps {
  /** Optional CSS class for the outer container */
  className?: string
}

/**
 * Reusable company information header for reports and print views.
 * Fetches company info from api/CompanyInfo/WOLogo on mount and displays
 * the business name and address lines. Can be attached to any report.
 */
export default function CompanyInfoHeader({ className }: CompanyInfoHeaderProps) {
  const { data, isLoading } = useSWR<CompanyInfo>(
    getApiUrl('/api/CompanyInfo/WOLogo'),
    getFetcher,
    { refreshInterval: 0 }
  )

  if (isLoading || !data) {
    return (
      <div className={`text-center py-2 ${className ?? ''}`}>
        <div className='h-4 w-48 bg-slate-200 animate-pulse rounded mx-auto mb-1' />
        <div className='h-3 w-64 bg-slate-100 animate-pulse rounded mx-auto' />
      </div>
    )
  }

  const businessName = data.tbbiBusinessName || ''
  const address1 = data.tbbi_Address1 || ''
  const address2 = data.tbbi_Address2 || ''

  return (
    <div className={`text-center ${className ?? ''}`}>
      <div className='h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg' />
      <div className='bg-slate-50 border border-slate-200 border-t-0 rounded-b-lg px-5 py-4'>
        <h1 className='text-xl font-bold text-slate-900 tracking-tight'>
          {businessName}
        </h1>
        {address1 && (
          <p className='text-xs text-slate-500 mt-0.5'>{address1}</p>
        )}
        {address2 && (
          <p className='text-xs text-slate-500'>{address2}</p>
        )}
      </div>
    </div>
  )
}
