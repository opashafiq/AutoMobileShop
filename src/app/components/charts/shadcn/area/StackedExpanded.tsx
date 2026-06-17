import CodePreview from '@/app/components/shared/CodePreview'
import StackedExpandedCode from './code/StackedExpandedCode'

const ChartAreaStackedExpand = () => {
  return (
    <>
      <CodePreview
        component={<StackedExpandedCode />}
        filePath='src/app/components/charts/shadcn/area/code/StackedExpandedCode.tsx'
        title='Stacked Expanded'
      />
    </>
  )
}

export default ChartAreaStackedExpand
