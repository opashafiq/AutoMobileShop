import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import UserDataTable from '@/app/components/react-tables/master/taxid-datatable'


export const metadata: Metadata = {
  title: 'User Table',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'User Table',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='User Table' items={BCrumb} />
      <h1>Welcome to the User Table</h1>
      <UserDataTable />
    </>
  )
}

export default page
