import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import ExpenseHeadTable from '@/app/components/react-tables/master/expensehead-datatable'

export const metadata: Metadata = {
  title: 'Expense Heads',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Expense Heads',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Expense Heads' items={BCrumb} />
      <ExpenseHeadTable enableColumnFilters={true} />
    </>
  )
}

export default page
