import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TransactionReports from '@/app/components/react-tables/report/transactionreports'

export const metadata: Metadata = {
  title: 'Transaction Reports',
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
    title: 'Transaction Reports',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Transaction Reports' items={BCrumb} />
      <TransactionReports />
    </>
  )
}

export default page
