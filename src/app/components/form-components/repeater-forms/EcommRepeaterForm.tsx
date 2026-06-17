import CodePreview from '@/app/components/shared/CodePreview'
import EcommRepeaterFormCode from './code/EcommRepeaterFormCode'

const EcommRepeaterForm = () => {
  return (
    <>
      <CodePreview
        component={<EcommRepeaterFormCode />}
        filePath='src/app/components/form-components/repeater-forms/code/EcommRepeaterFormCode.tsx'
        title='Ecomm Product Form'
      />
    </>
  )
}

export default EcommRepeaterForm
