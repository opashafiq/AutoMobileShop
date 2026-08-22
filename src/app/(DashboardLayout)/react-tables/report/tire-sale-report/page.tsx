import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TireSaleReport from '@/app/components/react-tables/report/tiresalereport'

export const metadata: Metadata = {
  title: 'Tire Sale Report',
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
    title: 'Tire Sale Report',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Tire Sale Report' items={BCrumb} />
      <TireSaleReport />
    </>
  )
}

export default page
