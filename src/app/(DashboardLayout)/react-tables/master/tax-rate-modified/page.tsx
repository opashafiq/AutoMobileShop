import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import TaxRateModifiedTable from '@/app/components/react-tables/master/taxratemodified-datatable'

export const metadata: Metadata = {
  title: 'Tax Rate Modified',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Tax Rate Modified',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Tax Rate Modified' items={BCrumb} />
      <TaxRateModifiedTable enableColumnFilters={true} />
    </>
  )
}

export default page
