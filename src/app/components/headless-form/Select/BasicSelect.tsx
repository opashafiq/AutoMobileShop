import CodePreview from '@/app/components/shared/CodePreview'
import Basicselect from './Code/BasicSelectCode'

const BasicSelect = () => {
  return (
    <div>
      <CodePreview
        component={<Basicselect />}
        filePath='src/app/components/headless-form/Select/Code/BasicSelectCode.tsx'
        title='Basic Select'
      />
    </div>
  )
}

export default BasicSelect
