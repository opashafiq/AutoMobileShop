import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceRefundDatatable from '@/app/components/react-tables/transaction/invoice-refund-datatable'

export const metadata: Metadata = {
  title: 'Invoice Refund',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Invoice Refund' },
]

export default function InvoiceRefundListPage() {
  return (
    <>
      <BreadcrumbComp title='Invoice Refund' items={BCrumb} />
      <InvoiceRefundDatatable />
    </>
  )
}
