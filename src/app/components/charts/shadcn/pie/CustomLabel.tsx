import CodePreview from '@/app/components/shared/CodePreview'
import CustomLabelCode from './code/CustomLabelCode'

const ChartPieLabelCustom = () => {
  return (
    <>
      <CodePreview
        component={<CustomLabelCode />}
        filePath='src/app/components/charts/shadcn/pie/code/CustomLabelCode.tsx'
        title='Custom Label'
      />
    </>
  )
}

export default ChartPieLabelCustom
