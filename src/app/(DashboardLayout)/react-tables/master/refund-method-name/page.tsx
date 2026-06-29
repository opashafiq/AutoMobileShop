import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import RefundMethodNameTable from '@/app/components/react-tables/master/refundmethodname-datatable'

export const metadata: Metadata = {
  title: 'Refund Method Names',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Refund Method Names',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Refund Method Names' items={BCrumb} />
      <RefundMethodNameTable enableColumnFilters={true} />
    </>
  )
}

export default page
