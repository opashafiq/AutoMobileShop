import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import DepartmentsTable from '@/app/components/react-tables/master/departments-datatable'

export const metadata: Metadata = {
  title: 'Departments',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Departments',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Departments' items={BCrumb} />
      <DepartmentsTable enableColumnFilters={true} />
    </>
  )
}

export default page
