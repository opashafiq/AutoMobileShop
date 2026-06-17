import CodePreview from '@/app/components/shared/CodePreview'
import SalesOverviewCode from './code/SalesOverviewCode'

const SalesOverviewChart = () => {
  return (
    <>
      <CodePreview
        component={<SalesOverviewCode />}
        filePath='src/app/components/widgets/charts/code/SalesOverviewCode.tsx'
        title='Sales Overview Chart'
      />
    </>
  )
}

export default SalesOverviewChart
