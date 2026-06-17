import CodePreview from '@/app/components/shared/CodePreview'
import CustomLabelCode from './code/CustomLabelCode'

const ChartBarLabelCustom = () => {
  return (
    <>
      <CodePreview
        component={<CustomLabelCode />}
        filePath='src/app/components/charts/shadcn/bar/code/CustomLabelCode.tsx'
        title='Custom Label'
      />
    </>
  )
}

export default ChartBarLabelCustom
