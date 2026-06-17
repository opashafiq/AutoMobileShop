import CodePreview from '@/app/components/shared/CodePreview'
import InteractiveCode from './code/InteractiveCode'

const ChartAreaInteractive = () => {
  return (
    <>
      <CodePreview
        component={<InteractiveCode />}
        filePath='src/app/components/charts/shadcn/area/code/InteractiveCode.tsx'
        title='Interactive'
      />
    </>
  )
}

export default ChartAreaInteractive
