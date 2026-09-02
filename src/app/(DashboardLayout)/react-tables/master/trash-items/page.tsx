import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TrashItemsTable from '@/app/components/react-tables/master/trashitems-datatable'

export const metadata: Metadata = {
  title: 'Trash Items',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Trash Items',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Trash Items' items={BCrumb} />
      <TrashItemsTable enableColumnFilters={true} />
    </>
  )
}

export default page
