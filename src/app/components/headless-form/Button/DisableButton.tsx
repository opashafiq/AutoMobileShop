import CodePreview from '@/app/components/shared/CodePreview'
import DisableButtonsCode from './Codes/DisableButtonsCode'

const DisableButton = () => {
  return (
    <div>
      <CodePreview
        component={<DisableButtonsCode />}
        filePath='src/app/components/headless-form/Button/code/DisableButtonsCode.tsx'
        title='Disable Buttons'
      />
    </div>
  )
}

export default DisableButton
