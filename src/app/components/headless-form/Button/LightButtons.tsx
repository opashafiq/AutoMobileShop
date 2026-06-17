import CodePreview from '@/app/components/shared/CodePreview'
import Lightbuttons from './Codes/LightButtonsCode'

const LightButtons = () => {
  return (
    <div>
      <CodePreview
        component={<Lightbuttons />}
        filePath='src/app/components/headless-form/Button/Codes/LightButtonsCode.tsx'
        title='Light Buttons'
      />
    </div>
  )
}
export default LightButtons
