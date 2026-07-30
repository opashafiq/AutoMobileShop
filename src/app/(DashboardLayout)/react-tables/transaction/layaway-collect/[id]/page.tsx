import { Metadata } from 'next'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayCollectForm from '@/app/components/react-tables/transaction/layaway-collect-form'

export const metadata: Metadata = {
  title: 'Collect Layaway Payment',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway-collect', title: 'Collect Layaway Pending Amount' },
  { to: '', title: 'Collect Payment' },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LayawayCollectPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Collect Payment' items={BCrumb} />
      <LayawayCollectForm layawayId={id} />
    </>
  )
}
