import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayCollectDatatable from '@/app/components/react-tables/transaction/layaway-collect-datatable'

export const metadata: Metadata = {
  title: 'Collect Layaway Pending Amount',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Collect Layaway Pending Amount' },
]

export default function LayawayCollectListPage() {
  return (
    <>
      <BreadcrumbComp title='Collect Layaway Pending Amount' items={BCrumb} />
      <LayawayCollectDatatable />
    </>
  )
}
