import CodePreview from '@/app/components/shared/CodePreview'
import LegendCode from './code/LegendCode'

const ChartAreaLegend = () => {
  return (
    <>
      <CodePreview
        component={<LegendCode />}
        filePath='src/app/components/charts/shadcn/area/code/LegendCode.tsx'
        title='Legend'
      />
    </>
  )
}

export default ChartAreaLegend
