import CodePreview from '@/app/components/shared/CodePreview'
import GridCode from './code/GridCode'

const ChartRadialGrid = () => {
  return (
    <>
      <CodePreview
        component={<GridCode />}
        filePath='src/app/components/charts/shadcn/radial/code/GridCode.tsx'
        title='Grid'
      />
    </>
  )
}

export default ChartRadialGrid
