import { Metadata } from 'next'
import { ImageComparison } from '@/app/components/animatedComponentDemo/image-comparison/ImageComparison'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'

export const metadata: Metadata = {
  title: 'Image Comparison',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Image Comparison',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Image Comparison' items={BCrumb} />
      <div>
        <div className='w-full'>
          <ImageComparison />
        </div>
      </div>
    </>
  )
}

export default page
