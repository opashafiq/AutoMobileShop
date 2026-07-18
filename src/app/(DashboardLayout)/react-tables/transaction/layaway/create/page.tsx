import { Metadata } from 'next'
import BreadcrumbComp from '../../../../layout/shared/breadcrumb/BreadcrumbComp'
import LayawayForm from '@/app/components/react-tables/transaction/layaway-form'

export const metadata: Metadata = {
  title: 'Create Layaway',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/react-tables/transaction/layaway', title: 'Layaway' },
  { to: '', title: 'Create' },
]

interface CreatePageProps {
  searchParams: Promise<{ reorder?: string }>
}

export default async function CreateLayawayPage({ searchParams }: CreatePageProps) {
  const { reorder } = await searchParams
  return (
    <>
      <BreadcrumbComp title={reorder ? 'Reorder Layaway' : 'Create Layaway'} items={BCrumb} />
      <LayawayForm mode='create' reorderId={reorder} />
    </>
  )
}
