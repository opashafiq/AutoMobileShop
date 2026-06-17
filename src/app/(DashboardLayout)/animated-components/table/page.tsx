import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { AnimateTable } from '@/app/components/animatedComponentDemo/animate-table/AnimateTable'

export const metadata: Metadata = {
  title: 'Animated Table',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Table',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Table' items={BCrumb} />
      <div>
        <div className='w-full'>
          <AnimateTable />
        </div>
      </div>
    </>
  )
}

export default page
