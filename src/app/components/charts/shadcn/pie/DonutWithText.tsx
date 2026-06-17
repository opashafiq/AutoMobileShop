import CodePreview from '@/app/components/shared/CodePreview'
import DonutWithTextCode from './code/DonutWithTextCode'

const ChartPieDonutText = () => {
  return (
    <>
      <CodePreview
        component={<DonutWithTextCode />}
        filePath='src/app/components/charts/shadcn/pie/code/DonutWithTextCode.tsx'
        title='Donut With Text'
      />
    </>
  )
}

export default ChartPieDonutText
