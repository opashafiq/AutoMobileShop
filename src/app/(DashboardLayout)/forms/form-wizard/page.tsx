import { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import EcommFormWizard from '@/app/components/form-components/form-wizard/EcommFormWizard'
import HealthCareWizardForm from '@/app/components/form-components/form-wizard/HealthCareWizardForm'

export const metadata: Metadata = {
  title: 'Form Wizards',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'form-wizards',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Form Wizards' items={BCrumb} />
      <div className='flex flex-col gap-6'>
        {/* Basic */}
        <div>
          <EcommFormWizard />
        </div>
        <div>
          <HealthCareWizardForm />
        </div>
      </div>
    </>
  )
}

export default page
