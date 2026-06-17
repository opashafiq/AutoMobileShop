import CodePreview from '@/app/components/shared/CodePreview'
import LinearCode from './code/LinearCode'

const ChartLineLinear = () => {
  return (
    <>
      <CodePreview
        component={<LinearCode />}
        filePath='src/app/components/charts/shadcn/line/code/LinearCode.tsx'
        title='Linear'
      />
    </>
  )
}

export default ChartLineLinear
