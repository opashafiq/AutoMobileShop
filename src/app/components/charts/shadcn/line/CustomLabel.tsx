import CodePreview from '@/app/components/shared/CodePreview'
import CustomLabelCode from './code/CustomLabelCode'

const ChartLineLabelCustom = () => {
  return (
    <>
      <CodePreview
        component={<CustomLabelCode />}
        filePath='src/app/components/charts/shadcn/line/code/CustomLabelCode.tsx'
        title='Custom Label'
      />
    </>
  )
}

export default ChartLineLabelCustom
