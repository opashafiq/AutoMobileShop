import CodePreview from '@/app/components/shared/CodePreview'
import GridNoneCode from './code/GridNoneCode'

const ChartRadarGridNone = () => {
  return (
    <>
      <CodePreview
        component={<GridNoneCode />}
        filePath='src/app/components/charts/shadcn/radar/code/GridNoneCode.tsx'
        title='Grid None'
      />
    </>
  )
}

export default ChartRadarGridNone
