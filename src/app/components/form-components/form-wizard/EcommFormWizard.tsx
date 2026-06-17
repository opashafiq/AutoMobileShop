import CodePreview from '@/app/components/shared/CodePreview'
import EcommFormWizardCode from './code/EcommFormWizardCode'

const EcommFormWizard = () => {
  return (
    <>
      <CodePreview
        component={<EcommFormWizardCode />}
        filePath='src/app/components/form-components/form-wizard/code/EcommFormWizardCode.tsx'
        title='Ecommerce Wizard Form'
      />
    </>
  )
}

export default EcommFormWizard
