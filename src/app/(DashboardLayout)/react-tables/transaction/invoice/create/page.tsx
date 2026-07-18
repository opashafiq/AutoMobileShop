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

interface CreatePageProps {
  searchParams: Promise<{ reorder?: string }>
}

export default async function CreateInvoicePage({ searchParams }: CreatePageProps) {
  const { reorder } = await searchParams
  return (
    <>
      <BreadcrumbComp title={reorder ? 'Reorder Invoice' : 'Create Invoice'} items={BCrumb} />
      <InvoiceForm mode='create' reorderId={reorder} />
    </>
  )
}