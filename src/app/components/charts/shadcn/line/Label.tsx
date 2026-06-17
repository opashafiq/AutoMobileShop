import CodePreview from '@/app/components/shared/CodePreview'
import LabelCode from './code/LabelCode'

const ChartLineLabel = () => {
  return (
    <>
      <CodePreview
        component={<LabelCode />}
        filePath='src/app/components/charts/shadcn/line/code/LabelCode.tsx'
        title='Label'
      />
    </>
  )
}

export default ChartLineLabel
