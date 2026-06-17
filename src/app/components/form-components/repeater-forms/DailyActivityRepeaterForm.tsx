import CodePreview from '@/app/components/shared/CodePreview'
import DailyActivityRepeaterFormCode from './code/DailyActivityRepeaterFormCode'

const DailyActivityRepeaterForm = () => {
  return (
    <>
      <CodePreview
        component={<DailyActivityRepeaterFormCode />}
        filePath='src/app/components/form-components/repeater-forms/code/DailyActivityRepeaterFormCode.tsx'
        title='Daily Activity Form'
      />
    </>
  )
}

export default DailyActivityRepeaterForm
