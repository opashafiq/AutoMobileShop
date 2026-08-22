import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import WheelSaleReport from '@/app/components/react-tables/report/wheelsalereport'

export const metadata: Metadata = {
  title: 'Wheel Sale Report',
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
    title: 'Wheel Sale Report',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Wheel Sale Report' items={BCrumb} />
      <WheelSaleReport />
    </>
  )
}

export default page