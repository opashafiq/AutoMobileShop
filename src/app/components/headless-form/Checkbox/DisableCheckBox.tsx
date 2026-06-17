import CodePreview from '@/app/components/shared/CodePreview'
import DisableCheck from './Codes/DisableCheckCode'

const DisableCheckBox = () => {
  return (
    <div>
      <CodePreview
        component={<DisableCheck />}
        filePath='src/app/components/headless-form/Checkbox/Codes/DisableCheckCode.tsx'
        title='Disable Checkbox'
      />
    </div>
  )
}

export default DisableCheckBox
