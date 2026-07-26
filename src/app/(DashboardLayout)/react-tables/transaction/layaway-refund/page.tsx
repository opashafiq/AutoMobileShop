import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayRefundDatatable from '@/app/components/react-tables/transaction/layaway-refund-datatable'

export const metadata: Metadata = {
  title: 'Layaway Refund',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Layaway Refund' },
]

export default function LayawayRefundListPage() {
  return (
    <>
      <BreadcrumbComp title='Layaway Refund' items={BCrumb} />
      <LayawayRefundDatatable />
    </>
  )
}
