import { Metadata } from 'next'
import BreadcrumbComp from '../../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayForm from '@/app/components/react-tables/transaction/layaway-form'

export const metadata: Metadata = {
  title: 'Edit Layaway',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway', title: 'Layaway' },
  { to: '', title: 'Edit' },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditLayawayPage({ params }: PageProps) {
  const { id } = await params
  return (
    <>
      <BreadcrumbComp title='Edit Layaway' items={BCrumb} />
      <LayawayForm mode='edit' layawayId={id} />
    </>
  )
}
