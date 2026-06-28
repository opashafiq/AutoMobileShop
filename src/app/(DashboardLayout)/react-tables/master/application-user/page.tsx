import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import ApplicationUserTable from '@/app/components/react-tables/master/applicationuser-datatable'

export const metadata: Metadata = {
  title: 'Application Users',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Application Users',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Application Users' items={BCrumb} />
      <h1>Application Users</h1>
      <ApplicationUserTable enableColumnFilters={true} />
    </>
  )
}

export default page
