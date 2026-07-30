import { Metadata } from 'next'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceCollectForm from '@/app/components/react-tables/transaction/invoice-collect-form'

export const metadata: Metadata = {
  title: 'Collect Payment',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice-collect', title: 'Collect Pending Amount' },
  { to: '', title: 'Collect Payment' },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceCollectPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Collect Payment' items={BCrumb} />
      <InvoiceCollectForm invoiceId={id} />
    </>
  )
}
