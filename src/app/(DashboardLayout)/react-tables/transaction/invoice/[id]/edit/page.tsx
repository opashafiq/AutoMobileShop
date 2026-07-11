import { Metadata } from 'next'
import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceForm from '@/app/components/react-tables/transaction/invoice-form'

export const metadata: Metadata = {
  title: 'Edit Invoice',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice', title: 'Invoice' },
  { to: '', title: 'Edit' },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Edit Invoice' items={BCrumb} />
      <InvoiceForm mode='edit' invoiceId={id} />
    </>
  )
}