import CodePreview from '@/app/components/shared/CodePreview'
import IncomeChartCode from './code/IncomeChartCode'

const incomeChart = () => {
  return (
    <>
      <CodePreview
        component={<IncomeChartCode />}
        filePath='src/app/components/widgets/charts/code/IncomeChartCode.tsx'
        title='Income Chart'
      />
    </>
  )
}

export default incomeChart
