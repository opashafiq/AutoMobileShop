import CodePreview from '@/app/components/shared/CodePreview'
import HealthCareFormWizardCode from './code/HealthCareFormWizardCode'

const HealthCareWizardForm = () => {
  return (
    <>
      <CodePreview
        component={<HealthCareFormWizardCode />}
        filePath='src/app/components/form-components/form-wizard/code/HealthCareFormWizardCode.tsx'
        title='Healthcare Wizard Form'
      />
    </>
  )
}

export default HealthCareWizardForm
