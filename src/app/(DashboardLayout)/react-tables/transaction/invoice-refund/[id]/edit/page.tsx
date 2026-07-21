import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import InvoiceRefundForm from '@/app/components/react-tables/transaction/invoice-refund-form'

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/invoice-refund', title: 'Invoice Refund' },
  { to: '', title: 'Edit' },
]

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoiceRefundPage({ params }: EditPageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title={`Edit Refund #${id}`} items={BCrumb} />
      <InvoiceRefundForm mode='edit' refundId={id} />
    </>
  )
}
