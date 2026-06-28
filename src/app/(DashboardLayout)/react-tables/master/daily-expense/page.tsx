import { Metadata } from 'next'
import BreadcrumbComp from '../../../layout/shared/breadcrumb/BreadcrumbComp'
import DailyExpenseTable from '@/app/components/react-tables/master/daily-expense-datatable'

export const metadata: Metadata = {
  title: 'Daily Expense',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '',
    title: 'Daily Expense',
  },
]

function page() {
  return (
    <>
      <BreadcrumbComp title='Daily Expense' items={BCrumb} />
      <DailyExpenseTable enableColumnFilters={true} />
    </>
  )
}

export default page
