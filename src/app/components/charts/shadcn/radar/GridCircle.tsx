import CodePreview from '@/app/components/shared/CodePreview'
import GridCircleCode from './code/GridCircleCode'

const ChartRadarGridCircle = () => {
  return (
    <>
      <CodePreview
        component={<GridCircleCode />}
        filePath='src/app/components/charts/shadcn/radar/code/GridCircleCode.tsx'
        title='Grid Circle'
      />
    </>
  )
}

export default ChartRadarGridCircle
