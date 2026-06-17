import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DotLoader from '@/app/components/animatedComponentDemo/loader/dot-loader/DotLoader'

export const metadata: Metadata = {
  title: 'Animated Loader',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Loader',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Loader' items={BCrumb} />
      <div>
        <div className='w-full'>
          <DotLoader />
        </div>
      </div>
    </>
  )
}

export default page
