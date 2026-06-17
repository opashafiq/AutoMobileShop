import CodePreview from '@/app/components/shared/CodePreview'
import Disabledfieldset from './Codes/DisableFieldsetCode'

const DisableFieldset = () => {
  return (
    <div>
      <CodePreview
        component={<Disabledfieldset />}
        filePath='src/app/components/headless-form/Fieldset/Codes/DisableFieldsetCode.tsx'
        title='Disable Fieldset Form'
      />
    </div>
  )
}

export default DisableFieldset
