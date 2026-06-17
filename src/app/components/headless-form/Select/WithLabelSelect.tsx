import CodePreview from '@/app/components/shared/CodePreview'
import WithLabelselect from './Code/WithLabelSelectCode'

const WithLabelSelect = () => {
  return (
    <div>
      <CodePreview
        component={<WithLabelselect />}
        filePath='src/app/components/headless-form/Select/Code/WithLabelSelectCode.tsx'
        title='With Label Select'
      />
    </div>
  )
}

export default WithLabelSelect
