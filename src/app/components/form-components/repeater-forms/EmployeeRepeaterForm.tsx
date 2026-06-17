import CodePreview from '@/app/components/shared/CodePreview'
import EmployeeRepeaterFormCode from './code/EmployeeRepeaterFormCode'

const EmployeeRepeaterForm = () => {
  return (
    <>
      <CodePreview
        component={<EmployeeRepeaterFormCode />}
        filePath='src/app/components/form-components/repeater-forms/code/EmployeeRepeaterFormCode.tsx'
        title='Employee Form'
      />
    </>
  )
}

export default EmployeeRepeaterForm
