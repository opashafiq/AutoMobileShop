import CodePreview from '@/app/components/shared/CodePreview'
import RegistrationFormCode from './code/RegistrationFormCode'

const RegistrationForm = () => {
  return (
    <>
      <CodePreview
        component={<RegistrationFormCode />}
        filePath='src/app/components/form-components/form-examples/code/RegistrationFormCode.tsx'
        title='Registration Form'
      />
    </>
  )
}

export default RegistrationForm
