import CodePreview from '@/app/components/shared/CodePreview'
import LegendCode from './code/LegendCode'

const ChartPieLegend = () => {
  return (
    <>
      <CodePreview
        component={<LegendCode />}
        filePath='src/app/components/charts/shadcn/pie/code/LegendCode.tsx'
        title='Legend'
      />
    </>
  )
}

export default ChartPieLegend
