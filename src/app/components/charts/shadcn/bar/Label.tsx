import CodePreview from '@/app/components/shared/CodePreview'
import LabelCode from './code/LabelCode'

const ChartBarLabel = () => {
  return (
    <>
      <CodePreview
        component={<LabelCode />}
        filePath='src/app/components/charts/shadcn/bar/code/LabelCode.tsx'
        title='Label'
      />
    </>
  )
}

export default ChartBarLabel
