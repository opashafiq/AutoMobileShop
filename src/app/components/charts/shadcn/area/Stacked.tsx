import CodePreview from '@/app/components/shared/CodePreview'
import StackedCode from './code/StackedCode'

const ChartAreaStacked = () => {
  return (
    <>
      <CodePreview
        component={<StackedCode />}
        filePath='src/app/components/charts/shadcn/area/code/StackedCode.tsx'
        title='Stacked'
      />
    </>
  )
}

export default ChartAreaStacked
