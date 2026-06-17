import CodePreview from '@/app/components/shared/CodePreview'
import InputWithLbl from './Codes/InputWithLblCode'

const InputWithLabel = () => {
  return (
    <div>
      <CodePreview
        component={<InputWithLbl />}
        filePath='src/app/components/headless-form/Input/Codes/InputWithLblCode.tsx'
        title='Input With Label'
      />
    </div>
  )
}

export default InputWithLabel
