'use client'

import { useRef } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import type { InvoiceListResponseItem } from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

import { Button } from '@/components/ui/button'
import InvoiceHeader from './InvoiceHeader'
import InvoiceMeta from './InvoiceMeta'
import CustomerInfo from './CustomerInfo'
import LineItemsTable from './LineItemsTable'
import PaymentHistory from './PaymentHistory'
import FinancialSummary from './FinancialSummary'
import WheelIndicator from './WheelIndicator'
import InvoiceFooter from './InvoiceFooter'
import './print.css'

interface InvoicePrintViewProps {
  invoiceId: string
}

/**
 * Main invoice print view component.
 * Fetches the invoice data via SWR and renders a print-ready one-page portrait invoice.
 * Supports:
 *   - Browser print (Ctrl+P / Print button)
 *   - PDF download (Download button)
 */
export default function InvoicePrintView({ invoiceId }: InvoicePrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useSWR<InvoiceListResponseItem>(
    getApiUrl(`/api/InvoiceMaster/${invoiceId}`),
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

    // Capture the invoice at exactly US Letter width (8.5in = 816px @ 96 DPI).
    // We use pixelRatio: 1 to keep the PNG dimensions predictable, and pass
    // explicit width/height to toPng so the capture is exactly 816px wide
    // regardless of any flex layout in the dashboard parent.
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
        pixelRatio: 1, // 1:1 so the PNG is exactly 816px wide
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
      pdf.save(`invoice-${data?.invoiceMasterDto?.tbim_InvoiceIdRad || invoiceId}.pdf`)
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
        <div className='text-sm text-slate-500'>Loading invoice...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-sm text-red-500'>
          Failed to load invoice. Please check the invoice ID and try again.
        </div>
      </div>
    )
  }

  const master = data.invoiceMasterDto
  const details = data.invoiceDetailsDto ?? []
  const payments = data.invoicePaymentsDto ?? []

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

      {/* Invoice content — what gets printed.
          Container uses max-w-[8.5in] for screen display. The PDF download
          handler clones this node into an off-screen 816px wrapper before
          capturing, so screen and PDF widths don't conflict. */}
      <div
        ref={printRef}
        className='invoice-print-root mx-auto bg-white text-slate-900 p-4 md:p-5'
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          maxWidth: '8.5in',
          width: '100%',
        }}
      >
        {/* 1. Header */}
        <InvoiceHeader master={master} />

        {/* 2. Meta row: Invoice #, Date, Status */}
        <InvoiceMeta master={master} />

        {/* 3. Customer + Vehicle info grid */}
        <CustomerInfo master={master} />

        {/* 4. Line items table */}
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

        {/* 5. Bottom row: Payment History + Wheel indicator + Financial summary */}
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

        {/* 6. Footer: Notes, Terms, Signature */}
        <InvoiceFooter note={master.tbim_Note} companyName={master.tbim_CompanyName} />
      </div>
    </div>
  )
}
