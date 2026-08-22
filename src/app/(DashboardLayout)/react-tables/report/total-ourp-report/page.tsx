import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TotalOurpReport from '@/app/components/react-tables/report/totalourpreport'

export const metadata: Metadata = {
  title: 'Total OURP Report',
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
    title: 'Total OURP Report',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Total OURP Report' items={BCrumb} />
      <TotalOurpReport />
    </>
  )
}

export default page