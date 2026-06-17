import CodePreview from '@/app/components/shared/CodePreview'
import InteractiveCode from './code/InteractiveCode'

const ChartPieInteractive = () => {
  return (
    <>
      <CodePreview
        component={<InteractiveCode />}
        filePath='src/app/components/charts/shadcn/pie/code/InteractiveCode.tsx'
        title='Interactive'
      />
    </>
  )
}

export default ChartPieInteractive
