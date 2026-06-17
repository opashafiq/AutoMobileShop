import CodePreview from '@/app/components/shared/CodePreview'
import DisableOutlineBtnCode from './Codes/DisableOutlineBtnCode'

const DisableOutlineButtons = () => {
  return (
    <div>
      <CodePreview
        component={<DisableOutlineBtnCode />}
        filePath='src/app/components/headless-form/Button/code/DisableOutlineBtnCode.tsx'
        title='Disable Outlined Buttons'
      />
    </div>
  )
}

export default DisableOutlineButtons
