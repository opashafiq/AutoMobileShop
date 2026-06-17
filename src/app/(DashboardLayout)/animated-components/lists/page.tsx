import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { AnimatedList } from '@/app/components/animatedComponentDemo/lists/animated-lists/AnimatedList'

export const metadata: Metadata = {
  title: 'Animated list',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated list',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated list' items={BCrumb} />
      <div>
        <div className='w-full'>
          <AnimatedList />
        </div>
      </div>
    </>
  )
}

export default page
