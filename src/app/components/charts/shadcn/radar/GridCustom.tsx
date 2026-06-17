import CodePreview from '@/app/components/shared/CodePreview'
import GridCustomCode from './code/GridCustomCode'

const ChartRadarGridCustom = () => {
  return (
    <>
      <CodePreview
        component={<GridCustomCode />}
        filePath='src/app/components/charts/shadcn/radar/code/GridCustomCode.tsx'
        title='Grid Custom'
      />
    </>
  )
}

export default ChartRadarGridCustom
