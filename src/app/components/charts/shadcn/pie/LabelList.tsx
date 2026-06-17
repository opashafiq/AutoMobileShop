import CodePreview from '@/app/components/shared/CodePreview'
import LabelListCode from './code/LabelListCode'

const ChartPieLabelList = () => {
  return (
    <>
      <CodePreview
        component={<LabelListCode />}
        filePath='src/app/components/charts/shadcn/pie/code/LabelListCode.tsx'
        title='Label List'
      />
    </>
  )
}

export default ChartPieLabelList
