import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { ElasticSlider } from '@/app/components/animatedComponentDemo/slider/elastic-slider/ElasticSlider'

export const metadata: Metadata = {
  title: 'Animated Slider',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Slider',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Slider' items={BCrumb} />
      <div>
        <div className='w-full'>
          <ElasticSlider />
        </div>
      </div>
    </>
  )
}

export default page
