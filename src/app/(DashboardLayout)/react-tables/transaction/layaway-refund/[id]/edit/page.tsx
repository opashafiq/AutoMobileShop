import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayRefundForm from '@/app/components/react-tables/transaction/layaway-refund-form'

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway-refund', title: 'Layaway Refund' },
  { to: '', title: 'Edit' },
]

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLayawayRefundPage({ params }: EditPageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title={`Edit Layaway Refund #${id}`} items={BCrumb} />
      <LayawayRefundForm mode='edit' refundId={id} />
    </>
  )
}
