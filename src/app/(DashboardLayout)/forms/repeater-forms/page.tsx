import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import CourseRepeaterForm from '@/app/components/form-components/repeater-forms/CourseRepeaterForm'
import DailyActivityRepeaterForm from '@/app/components/form-components/repeater-forms/DailyActivityRepeaterForm'
import EcommRepeaterForm from '@/app/components/form-components/repeater-forms/EcommRepeaterForm'
import EmployeeRepeaterForm from '@/app/components/form-components/repeater-forms/EmployeeRepeaterForm'

export const metadata: Metadata = {
  title: 'Repeater Forms',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'repeater-forms',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Repeater Forms' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        {/* Basic */}
        <div>
          <EcommRepeaterForm />
        </div>
        <div>
          <CourseRepeaterForm />
        </div>
        <div>
          <EmployeeRepeaterForm />
        </div>
        <div>
          <DailyActivityRepeaterForm />
        </div>
      </div>
    </>
  )
}

export default page
