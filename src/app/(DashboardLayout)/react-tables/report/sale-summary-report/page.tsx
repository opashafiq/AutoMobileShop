import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import SaleSummaryReport from '@/app/components/react-tables/report/salesummaryreport'

export const metadata: Metadata = {
  title: 'Sale Summary Report',
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
    title: 'Sale Summary Report',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Sale Summary Report' items={BCrumb} />
      <SaleSummaryReport />
    </>
  )
}

export default page