import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import RolesTable from '@/app/components/react-tables/master/roles-datatable'

export const metadata: Metadata = {
  title: 'Roles',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Roles',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Roles' items={BCrumb} />
      <RolesTable enableColumnFilters={true} />
    </>
  )
}

export default page
