import CodePreview from '@/app/components/shared/CodePreview'
import InputWithdescription from './Codes/InputWithDescriptionCode'

const InputWithDescription = () => {
  return (
    <div>
      <CodePreview
        component={<InputWithdescription />}
        filePath='src/app/components/headless-form/Input/Codes/InputWithDescriptionCode.tsx'
        title='Input With Description'
      />
    </div>
  )
}

export default InputWithDescription
