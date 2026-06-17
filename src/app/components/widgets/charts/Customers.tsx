import CodePreview from '@/app/components/shared/CodePreview'
import CustomersCode from './code/CustomersCode'

const CustomersChart = () => {
  return (
    <>
      <CodePreview
        component={<CustomersCode />}
        filePath='src/app/components/widgets/charts/code/CustomersCode.tsx'
        title='Customer Chart'
      />
    </>
  )
}

export default CustomersChart
