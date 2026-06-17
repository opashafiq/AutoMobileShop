import CodePreview from '@/app/components/shared/CodePreview'
import DonutCode from './code/DonutCode'

const ChartPieDonut = () => {
  return (
    <>
      <CodePreview
        component={<DonutCode />}
        filePath='src/app/components/charts/shadcn/pie/code/DonutCode.tsx'
        title='Donut'
      />
    </>
  )
}

export default ChartPieDonut
