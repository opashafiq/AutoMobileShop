import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceDatatable from '@/app/components/react-tables/transaction/invoice-datatable'

export const metadata: Metadata = {
  title: 'Invoice',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Invoice' },
]

export default function InvoiceListPage() {
  return (
    <>
      <BreadcrumbComp title='Invoice' items={BCrumb} />
      <InvoiceDatatable />
    </>
  )
}
