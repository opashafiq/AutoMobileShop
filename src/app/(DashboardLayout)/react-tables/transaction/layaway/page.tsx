import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayDatatable from '@/app/components/react-tables/transaction/layaway-datatable'

export const metadata: Metadata = {
  title: 'Layaway',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Layaway' },
]

export default function LayawayListPage() {
  return (
    <>
      <BreadcrumbComp title='Layaway' items={BCrumb} />
      <LayawayDatatable />
    </>
  )
}
