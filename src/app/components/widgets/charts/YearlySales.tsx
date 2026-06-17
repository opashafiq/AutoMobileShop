import CodePreview from '@/app/components/shared/CodePreview'
import YearlySales from './code/YearlySalesCode'

const YearlySalesChart = () => {
  return (
    <>
      <CodePreview
        component={<YearlySales />}
        filePath='src/app/components/widgets/charts/code/YearlySalesCode.tsx'
        title='Yearly Sales Chart'
      />
    </>
  )
}

export default YearlySalesChart
