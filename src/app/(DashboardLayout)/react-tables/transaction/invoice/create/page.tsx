import { Metadata } from 'next'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceForm from '@/app/components/react-tables/transaction/invoice-form'

export const metadata: Metadata = {
  title: 'Create Invoice',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice', title: 'Invoice' },
  { to: '', title: 'Create' },
]

export default function CreateInvoicePage() {
  return (
    <>
      <BreadcrumbComp title='Create Invoice' items={BCrumb} />
      <InvoiceForm mode='create' />
    </>
  )
}