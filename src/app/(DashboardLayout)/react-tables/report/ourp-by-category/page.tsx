import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import OurpByCategoryReport from '@/app/components/react-tables/report/ourpbycategory'

export const metadata: Metadata = {
  title: 'OURP By Category',
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
    title: 'OURP By Category',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='OURP By Category' items={BCrumb} />
      <OurpByCategoryReport />
    </>
  )
}

export default page
