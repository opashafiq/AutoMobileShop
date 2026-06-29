import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import CompanyInfoTable from '@/app/components/react-tables/master/companyinfo-datatable'

export const metadata: Metadata = {
  title: 'Company Info',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Company Info',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Company Info' items={BCrumb} />
      <CompanyInfoTable enableColumnFilters={true} />
    </>
  )
}

export default page
