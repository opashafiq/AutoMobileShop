import CodePreview from '@/app/components/shared/CodePreview'
import StackedLegendCode from './code/StackedLegendCode'

const ChartBarStacked = () => {
  return (
    <>
      <CodePreview
        component={<StackedLegendCode />}
        filePath='src/app/components/charts/shadcn/bar/code/StackedLegendCode.tsx'
        title='Stacked + Legend'
      />
    </>
  )
}

export default ChartBarStacked
