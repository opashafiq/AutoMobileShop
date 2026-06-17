import CodePreview from '@/app/components/shared/CodePreview'
import AxesCode from './code/AxesCode'

const ChartAreaAxes = () => {
  return (
    <>
      <CodePreview
        component={<AxesCode />}
        filePath='src/app/components/charts/shadcn/area/code/AxesCode.tsx'
        title='Axes'
      />
    </>
  )
}

export default ChartAreaAxes
