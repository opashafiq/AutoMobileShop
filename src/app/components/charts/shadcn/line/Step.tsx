import CodePreview from '@/app/components/shared/CodePreview'
import StepCode from './code/StepCode'

const ChartLineStep = () => {
  return (
    <>
      <CodePreview
        component={<StepCode />}
        filePath='src/app/components/charts/shadcn/line/code/StepCode.tsx'
        title='Step'
      />
    </>
  )
}

export default ChartLineStep
