import CodePreview from '@/app/components/shared/CodePreview'
import DonutActiveCode from './code/DonutActiveCode'

const ChartPieDonutActive = () => {
  return (
    <>
      <CodePreview
        component={<DonutActiveCode />}
        filePath='src/app/components/charts/shadcn/pie/code/DonutActiveCode.tsx'
        title='Donut Active'
      />
    </>
  )
}

export default ChartPieDonutActive
