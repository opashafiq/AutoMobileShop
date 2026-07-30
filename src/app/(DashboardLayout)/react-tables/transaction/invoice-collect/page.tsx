import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceCollectDatatable from '@/app/components/react-tables/transaction/invoice-collect-datatable'

export const metadata: Metadata = {
  title: 'Collect Pending Amount',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Collect Pending Amount' },
]

export default function InvoiceCollectListPage() {
  return (
    <>
      <BreadcrumbComp title='Collect Pending Amount' items={BCrumb} />
      <InvoiceCollectDatatable />
    </>
  )
}
