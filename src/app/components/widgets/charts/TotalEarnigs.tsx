import CodePreview from '@/app/components/shared/CodePreview'
import TotalEarningCode from './code/TotalEarnigsCode'

const TotalEarningsChart = () => {
  return (
    <>
      <CodePreview
        component={<TotalEarningCode />}
        filePath='src/app/components/widgets/charts/code/TotalEarnigsCode.tsx'
        title='Total Earning Chart'
      />
    </>
  )
}

export default TotalEarningsChart
