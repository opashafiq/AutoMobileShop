import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import AuditTrailDatatable from '@/app/components/react-tables/audit-trail-datatable'

export const metadata: Metadata = {
  title: 'Audit Trail',
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '', title: 'Audit Trail' },
]

export default function AuditTrailPage() {
  return (
    <>
      <BreadcrumbComp title='Audit Trail' items={BCrumb} />
      <AuditTrailDatatable />
    </>
  )
}
