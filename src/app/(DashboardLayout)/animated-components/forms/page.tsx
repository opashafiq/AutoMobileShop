import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { FileUpload } from '@/app/components/animatedComponentDemo/forms/file-upload/FileUpload'
import { InputForm } from '@/app/components/animatedComponentDemo/forms/input-forms/InputForm'
import { InputPlaceholder } from '@/app/components/animatedComponentDemo/forms/input-placeholder/InputPlaceholder'

export const metadata: Metadata = {
  title: 'Animated Forms',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Animated Forms',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Animated Forms' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <InputForm />
        </div>
        <div className='col-span-12'>
          <InputPlaceholder />
        </div>
        <div className='col-span-12'>
          <FileUpload />
        </div>
      </div>
    </>
  )
}

export default page
