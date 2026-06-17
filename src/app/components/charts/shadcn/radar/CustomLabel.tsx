import CodePreview from '@/app/components/shared/CodePreview'
import CustomLabelCode from './code/CustomLabelCode'

const ChartRadarLabelCustom = () => {
  return (
    <>
      <CodePreview
        component={<CustomLabelCode />}
        filePath='src/app/components/charts/shadcn/radar/code/CustomLabelCode.tsx'
        title='Custom Label'
      />
    </>
  )
}

export default ChartRadarLabelCustom
