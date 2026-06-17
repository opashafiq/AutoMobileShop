import CodePreview from '@/app/components/shared/CodePreview'
import WithDescriptionselect from './Code/WithDescriptionSelectCode'

const WithDescriptionSelect = () => {
  return (
    <div>
      <CodePreview
        component={<WithDescriptionselect />}
        filePath='src/app/components/headless-form/Select/Code/WithDescriptionSelectCode.tsx'
        title='With Descrioption Select'
      />
    </div>
  )
}

export default WithDescriptionSelect
