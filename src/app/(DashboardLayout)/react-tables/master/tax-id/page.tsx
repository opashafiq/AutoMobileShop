import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TaxIdTable from '@/app/components/react-tables/master/taxid-datatable'


export const metadata: Metadata = {
  title: 'Tax ID',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Tax ID',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Tax ID' items={BCrumb} />
      <TaxIdTable enableColumnFilters={true}/>
    </>
  )
}

export default page
