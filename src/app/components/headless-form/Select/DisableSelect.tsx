import CodePreview from '@/app/components/shared/CodePreview'
import Disableselect from './Code/DisableSelectCode'

const DisabledSelect = () => {
  return (
    <div>
      <CodePreview
        component={<Disableselect />}
        filePath='src/app/components/headless-form/Select/Code/DisableSelectCode.tsx'
        title='Disabeld Select'
      />
    </div>
  )
}

export default DisabledSelect
