import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import RegistrationForm from '@/app/components/form-components/form-examples/RegistrationForm'
import StudentEnrollmentForm from '@/app/components/form-components/form-examples/StudentEnrollmentForm'

export const metadata: Metadata = {
  title: 'Form Examples',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'form-examples',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Form Examples' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        {/* Basic */}
        <div>
          <RegistrationForm />
        </div>
        <div>
          <StudentEnrollmentForm />
        </div>
      </div>
    </>
  )
}

export default page
