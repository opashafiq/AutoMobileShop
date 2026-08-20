import { Metadata } from 'next'
import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayPrintView from '@/app/components/react-tables/transaction/layaway-print'

export const metadata: Metadata = {
  title: 'Print Layaway',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway', title: 'Layaway' },
  { to: '', title: 'Print' },
]

interface PrintPageProps {
  params: Promise<{ id: string }>
}

export default async function PrintLayawayPage({ params }: PrintPageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Print Layaway' items={BCrumb} />
      <LayawayPrintView layawayId={id} />
    </>
  )
}
