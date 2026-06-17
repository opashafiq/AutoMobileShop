import CodePreview from '@/app/components/shared/CodePreview'
import RevenueUpdatesCode from './code/RevenueUpdatesCode'

const RevenueUpdatesChart = () => {
  return (
    <>
      <CodePreview
        component={<RevenueUpdatesCode />}
        filePath='src/app/components/widgets/charts/code/RevenueUpdatesCode.tsx'
        title='Revenue Updates Chart'
      />
    </>
  )
}

export default RevenueUpdatesChart
