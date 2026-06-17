import CodePreview from '@/app/components/shared/CodePreview'
import LegendCode from './code/LegendCode'

const ChartRadarLegend = () => {
  return (
    <>
      <CodePreview
        component={<LegendCode />}
        filePath='src/app/components/charts/shadcn/radar/code/LegendCode.tsx'
        title='Legend'
      />
    </>
  )
}

export default ChartRadarLegend
