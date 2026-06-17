import CodePreview from '@/app/components/shared/CodePreview'
import LabelCode from './code/LabelCode'

const ChartRadialLabel = () => {
  return (
    <>
      <CodePreview
        component={<LabelCode />}
        filePath='src/app/components/charts/shadcn/radial/code/LabelCode.tsx'
        title='Label'
      />
    </>
  )
}

export default ChartRadialLabel
