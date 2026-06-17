import CodePreview from '@/app/components/shared/CodePreview'
import ShapeCode from './code/ShapeCode'

const ChartRadialShape = () => {
  return (
    <>
      <CodePreview
        component={<ShapeCode />}
        filePath='src/app/components/charts/shadcn/radial/code/ShapeCode.tsx'
        title='Shape'
      />
    </>
  )
}

export default ChartRadialShape
