import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import DistributorsTable from '@/app/components/react-tables/master/distributors-datatable'

export const metadata: Metadata = {
  title: 'Distributors',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Distributors',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Distributors' items={BCrumb} />
      <DistributorsTable enableColumnFilters={true} />
    </>
  )
}

export default page
