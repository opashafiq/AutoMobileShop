import CodePreview from '@/app/components/shared/CodePreview'
import YarlyBreakupCode from './code/YearlyBreakupCode'

const YearlyBreakupChart = () => {
  return (
    <>
      <CodePreview
        component={<YarlyBreakupCode />}
        filePath='src/app/components/widgets/charts/code/YearlyBreakupCode.tsx'
        title='Yearly Breakup Chart'
      />
    </>
  )
}

export default YearlyBreakupChart
