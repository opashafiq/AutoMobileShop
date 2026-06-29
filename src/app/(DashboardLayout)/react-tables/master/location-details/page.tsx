import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import LocationDetailsTable from '@/app/components/react-tables/master/locationdetails-datatable'

export const metadata: Metadata = {
  title: 'Location Details',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Location Details',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Location Details' items={BCrumb} />
      <LocationDetailsTable enableColumnFilters={true} />
    </>
  )
}

export default page
