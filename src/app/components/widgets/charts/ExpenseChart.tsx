import CodePreview from '@/app/components/shared/CodePreview'
import ExpenseChartCode from './code/ExpenseChartCode'


const ExpenseChart = () => {
  return (
    <>
      <CodePreview
        component={<ExpenseChartCode />}
        filePath='src/app/components/widgets/charts/code/ExpenseChartCode.tsx'
        title='Expense Chart'
      />
    </>
  )
}

export default ExpenseChart
