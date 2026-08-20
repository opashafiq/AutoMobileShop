'use client'

import { useRef } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import type { LayawayListResponseItem } from '@/app/(DashboardLayout)/types/apps/layawayMaster'
// Reused invoice-print sub-components (structurally identical DTOs)
import type {
  InvoiceMasterDto,
  InvoiceDetailsDto,
  InvoicePaymentsDto,
} from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

import { Button } from '@/components/ui/button'
import InvoiceHeader from '../invoice-print/InvoiceHeader'
import CustomerInfo from '../invoice-print/CustomerInfo'
import LineItemsTable from '../invoice-print/LineItemsTable'
import PaymentHistory from '../invoice-print/PaymentHistory'
import FinancialSummary from '../invoice-print/FinancialSummary'
import WheelIndicator from '../invoice-print/WheelIndicator'
import LayawayMeta from './LayawayMeta'
import LayawayFooter from './LayawayFooter'
import './print.css'

interface LayawayPrintViewProps {
  layawayId: string
}

// Payment-type legend shown on the layaway print (per sample invoice).
const PAYMENT_LEGEND = ['CASH', 'CREDIT CARD', 'CHECK', 'ELECT REG']

/**
 * Main layaway print view component.
 * Fetches the layaway data via SWR and renders a print-ready one-page portrait
 * report that mirrors the invoice template, with layaway-specific text.
 *
 * Supports:
 *   - Browser print (Ctrl+P / Print button)
 *   - PDF download (Download button)
 *
 * All sub-components (header, customer info, line items, payment history,
 * wheel indicator, financial summary) are reused directly from invoice-print/
 * because LayawayMasterDto / LayawayDetailsDto / LayawayPaymentsDto share the
 * same tbim_* / tbid_* / tbip_* field names as their invoice counterparts
 * (TypeScript structural typing).
 */
export default function LayawayPrintView({ layawayId }: LayawayPrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useSWR<LayawayListResponseItem>(
    getApiUrl(`/api/LayawayMaster/${layawayId}`),
    getFetcher,
    { refreshInterval: 0 }
  )

  // ---- Handlers ----
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    const node = printRef.current
    if (!node) return

    // Capture the report at exactly US Letter width (8.5in = 816px @ 96 DPI).
    const PAGE_WIDTH_PX = 816

    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.left = '-99999px'
    wrapper.style.top = '0'
    wrapper.style.width = `${PAGE_WIDTH_PX}px`
    wrapper.style.background = '#ffffff'
    document.body.appendChild(wrapper)

    const clone = node.cloneNode(true) as HTMLDivElement
    clone.style.width = `${PAGE_WIDTH_PX}px`
    clone.style.maxWidth = `${PAGE_WIDTH_PX}px`
    clone.style.minWidth = `${PAGE_WIDTH_PX}px`
    clone.style.boxSizing = 'border-box'
    wrapper.appendChild(clone)

    try {
      const dataUrl = await toPng(clone, {
        quality: 1.0,
        pixelRatio: 1,
        backgroundColor: '#ffffff',
        width: PAGE_WIDTH_PX,
        height: clone.scrollHeight,
        cacheBust: true,
      })

      const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' })

      const pageWidth = pdf.internal.pageSize.getWidth() // 8.5
      const pageHeight = pdf.internal.pageSize.getHeight() // 11
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfHeight = (imgProps.height / imgProps.width) * pageWidth

      if (pdfHeight <= pageHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pdfHeight)
      } else {
        const pageHeightInImg = pageHeight * (imgProps.width / pageWidth)
        let y = 0
        while (y < imgProps.height) {
          pdf.addImage(dataUrl, 'PNG', 0, -y, pageWidth, pdfHeight)
          y += pageHeightInImg
          if (y < imgProps.height) pdf.addPage()
        }
      }
      pdf.save(`layaway-${data?.layawayMasterDto?.tbim_InvoiceIdRad || layawayId}.pdf`)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  // ---- Loading / Error states ----
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-sm text-slate-500'>Loading layaway...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-sm text-red-500'>
          Failed to load layaway. Please check the layaway ID and try again.
        </div>
      </div>
    )
  }

  const master = data.layawayMasterDto
  const details = (data.layawayDetailsDto ?? []) as unknown as InvoiceDetailsDto[]
  const payments = (data.layawayPaymentsDto ?? []) as unknown as InvoicePaymentsDto[]

  return (
    <div>
      {/* Action bar — hidden when printing */}
      <div className='no-print flex items-center gap-3 mb-4 pb-3 border-b border-slate-200'>
        <Button variant='outline' size='sm' onClick={handlePrint}>
          <Icon icon='solar:printer-linear' width={16} height={16} className='me-1.5' />
          Print
        </Button>
        <Button variant='outline' size='sm' onClick={handleDownloadPdf}>
          <Icon icon='solar:download-linear' width={16} height={16} className='me-1.5' />
          Download PDF
        </Button>
      </div>

      {/* Layaway content — what gets printed. */}
      <div
        ref={printRef}
        className='invoice-print-root mx-auto bg-white text-slate-900 p-4 md:p-5'
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          maxWidth: '8.5in',
          width: '100%',
        }}
      >
        {/* 1. Header (reused — reads getUserSession() for company name/address) */}
        <InvoiceHeader master={master as unknown as InvoiceMasterDto} />

        {/* 2. Title banner — layaway-specific */}
        <div className='flex items-center justify-between mb-3 px-1'>
          <h2 className='text-base font-bold tracking-wide text-slate-900 uppercase'>
            Layaway Invoice
          </h2>
          {/* Payment-type legend */}
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            {PAYMENT_LEGEND.map((p) => (
              <span
                key={p}
                className='text-[9px] font-medium uppercase tracking-wider text-slate-400'
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Meta row: Layaway #, Date, Status */}
        <LayawayMeta master={master} />

        {/* 4. Customer + Vehicle info grid (reused) */}
        <CustomerInfo master={master as unknown as InvoiceMasterDto} />

        {/* 5. Line items table (reused) */}
        <div className='mb-4 overflow-hidden'>
          <LineItemsTable
            details={details}
            master={{
              tbim_SubTotal: master.tbim_SubTotal,
              tbim_SaleTax: master.tbim_SaleTax,
              tbim_Labour: master.tbim_Labour,
              tbim_DisPer: master.tbim_DisPer,
              tbim_DisAmt: master.tbim_DisAmt,
              tbim_AdjAmt: master.tbim_AdjAmt,
              tbim_Total: master.tbim_Total,
              tbim_AdjTotal: master.tbim_AdjTotal,
            }}
          />
        </div>

        {/* 6. Bottom row: Payment History + Wheel indicator + Financial summary */}
        <div className='invoice-bottom-grid grid grid-cols-1 md:grid-cols-3 gap-3 mb-4'>
          <div className={payments.length > 0 ? 'col-span-1' : 'hidden'}>
            <PaymentHistory payments={payments} />
          </div>
          <div className='flex justify-center items-start'>
            <WheelIndicator
              lf={master.tbim_Left_Front}
              rf={master.tbim_Right_Front}
              lr={master.tbim_Left_Rear}
              rr={master.tbim_Right_Rear}
            />
          </div>
          <div>
            <FinancialSummary
              master={{
                tbim_SubTotal: master.tbim_SubTotal,
                tbim_SaleTax: master.tbim_SaleTax,
                tbim_Labour: master.tbim_Labour,
                tbim_DisPer: master.tbim_DisPer,
                tbim_DisAmt: master.tbim_DisAmt,
                tbim_Total: master.tbim_Total,
                tbim_AdjAmt: master.tbim_AdjAmt,
                tbim_AdjTotal: master.tbim_AdjTotal,
                tbim_PaidAmt: master.tbim_PaidAmt,
                tbim_PayInfo: master.tbim_PayInfo,
              }}
            />
          </div>
        </div>

        {/* 7. Footer: Notes, Terms, Signature */}
        <LayawayFooter note={master.tbim_Note} companyName={master.tbim_CompanyName} />
      </div>
    </div>
  )
}
