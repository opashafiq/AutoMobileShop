import CodePreview from '@/app/components/shared/CodePreview'
import LabelCode from './code/LabelCode'

const ChartPieLabel = () => {
  return (
    <>
      <CodePreview
        component={<LabelCode />}
        filePath='src/app/components/charts/shadcn/pie/code/LabelCode.tsx'
        title='Label'
      />
    </>
  )
}

export default ChartPieLabel
