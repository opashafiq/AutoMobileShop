import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import ItemMasterTable from '@/app/components/react-tables/master/itemmaster-datatable'

export const metadata: Metadata = {
  title: 'Item Master',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Item Master',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Item Master' items={BCrumb} />
      <ItemMasterTable enableColumnFilters={true} />
    </>
  )
}

export default page
