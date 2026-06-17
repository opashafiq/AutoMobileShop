import CodePreview from '@/app/components/shared/CodePreview'
import EarnedChartCode from './code/EarnedChartCode'

const RevenueChart = () => {
  return (
    <>
      <CodePreview
        component={<EarnedChartCode />}
        filePath='src/app/components/widgets/charts/code/EarnedChartCode.tsx'
        title='Earned Chart'
      />
    </>
  )
}

export default RevenueChart
