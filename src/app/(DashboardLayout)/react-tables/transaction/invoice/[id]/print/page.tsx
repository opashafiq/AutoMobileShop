import { Metadata } from 'next'
import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoicePrintView from '@/app/components/react-tables/transaction/invoice-print'

export const metadata: Metadata = {
  title: 'Print Invoice',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice', title: 'Invoice' },
  { to: '', title: 'Print' },
]

interface PrintPageProps {
  params: Promise<{ id: string }>
}

export default async function PrintInvoicePage({ params }: PrintPageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Print Invoice' items={BCrumb} />
      <InvoicePrintView invoiceId={id} />
    </>
  )
}
