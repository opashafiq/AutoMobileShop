import CodePreview from '@/app/components/shared/CodePreview'
import MonthlyEarningCode from './code/MonthlyEarningCode'

const monthlyEarning = () => {
  return (
    <>
      <CodePreview
        component={<MonthlyEarningCode />}
        filePath='src/app/components/widgets/charts/code/MonthlyEarningCode.tsx'
        title='Monthly Earning Chart'
      />
    </>
  )
}

export default monthlyEarning
