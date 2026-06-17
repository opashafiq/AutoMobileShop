import CodePreview from '@/app/components/shared/CodePreview'
import StepCode from './code/StepCode'

const ChartAreaStep = () => {
  return (
    <>
      <CodePreview
        component={<StepCode />}
        filePath='src/app/components/charts/shadcn/area/code/StepCode.tsx'
        title='Step'
      />
    </>
  )
}

export default ChartAreaStep
