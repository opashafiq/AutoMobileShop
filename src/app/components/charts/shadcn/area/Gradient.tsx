import CodePreview from '@/app/components/shared/CodePreview'
import GradientCode from './code/GradientCode'

const ChartAreaGradient = () => {
  return (
    <>
      <CodePreview
        component={<GradientCode />}
        filePath='src/app/components/charts/shadcn/area/code/GradientCode.tsx'
        title='Gradient'
      />
    </>
  )
}

export default ChartAreaGradient
