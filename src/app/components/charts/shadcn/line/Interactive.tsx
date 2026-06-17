import CodePreview from '@/app/components/shared/CodePreview'
import InteractiveCode from './code/InteractiveCode'

const ChartLineInteractive = () => {
  return (
    <>
      <CodePreview
        component={<InteractiveCode />}
        filePath='src/app/components/charts/shadcn/line/code/InteractiveCode.tsx'
        title='Interactive'
      />
    </>
  )
}

export default ChartLineInteractive
