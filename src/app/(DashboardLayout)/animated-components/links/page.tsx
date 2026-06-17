import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { LinkPreview } from '@/app/components/animatedComponentDemo/links/preview-links/LinkPreview'

export const metadata: Metadata = {
  title: 'Animated Links',
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
          <LinkPreview />
        </div>
      </div>
    </>
  )
}

export default page
