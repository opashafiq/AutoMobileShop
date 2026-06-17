import CodePreview from '@/app/components/shared/CodePreview'
import GridFilledCode from './code/GridFilledCode'

const ChartRadarGridFill = () => {
  return (
    <>
      <CodePreview
        component={<GridFilledCode />}
        filePath='src/app/components/charts/shadcn/radar/code/GridFilledCode.tsx'
        title='Grid Filled'
      />
    </>
  )
}

export default ChartRadarGridFill
