import CodePreview from '@/app/components/shared/CodePreview'
import StackedCode from './code/StackedCode'

const ChartPieStacked = () => {
  return (
    <>
      <CodePreview
        component={<StackedCode />}
        filePath='src/app/components/charts/shadcn/pie/code/StackedCode.tsx'
        title='Stacked'
      />
    </>
  )
}

export default ChartPieStacked
