import CodePreview from '@/app/components/shared/CodePreview'
import StackedCode from './code/StackedCode'

const ChartRadialStacked = () => {
  return (
    <>
      <CodePreview
        component={<StackedCode />}
        filePath='src/app/components/charts/shadcn/radial/code/StackedCode.tsx'
        title='Stacked'
      />
    </>
  )
}

export default ChartRadialStacked
