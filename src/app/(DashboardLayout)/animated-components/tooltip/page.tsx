import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { AnimatedTooltip } from '@/app/components/animatedComponentDemo/animated-tooltip/AnimatedTooltip'


export const metadata: Metadata = {
  title: 'Animated Tooltip',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Tooltip',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Tooltip' items={BCrumb} />
      <div>
        <div className='w-full'>
          <AnimatedTooltip />
        </div>
      </div>
    </>
  )
}

export default page
