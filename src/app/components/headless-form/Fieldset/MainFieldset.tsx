import CodePreview from '@/app/components/shared/CodePreview'
import Fieldset from './Codes/FieldsetCode'

const MainFieldset = () => {
  return (
    <div>
      <CodePreview
        component={<Fieldset />}
        filePath='src/app/components/headless-form/Fieldset/Codes/FieldsetCode.tsx'
        title='Fieldset Form'
      />
    </div>
  )
}

export default MainFieldset
