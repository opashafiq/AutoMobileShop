import CodePreview from '@/app/components/shared/CodePreview'
import LinearCode from './code/LinearCode'

const ChartAreaLinear = () => {
  return (
    <>
      <CodePreview
        component={<LinearCode />}
        filePath='src/app/components/charts/shadcn/area/code/LinearCode.tsx'
        title='Linear'
      />
    </>
  )
}

export default ChartAreaLinear
