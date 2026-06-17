import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { AnimatedTab } from '@/app/components/animatedComponentDemo/tabs/animated-tab/AnimatedTab'
import { TransitionTab } from '@/app/components/animatedComponentDemo/tabs/transition-tab/TransitionTab'

export const metadata: Metadata = {
  title: 'Animated Tabs',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Tabs',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Tabs' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        <div>
          <AnimatedTab />
        </div>
        <div>
          <TransitionTab />
        </div>
      </div>
    </>
  )
}

export default page
