import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import CustomerDetailsReport from '@/app/components/react-tables/report/customerdetails'

export const metadata: Metadata = {
  title: 'Customer Details',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/react-tables/report',
    title: 'Report',
  },
  {
    to: '',
    title: 'Customer Details',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Customer Details' items={BCrumb} />
      <CustomerDetailsReport />
    </>
  )
}

export default page
