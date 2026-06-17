import CodePreview from '@/app/components/shared/CodePreview'
import InteractiveCode from './code/InteractiveCode'

const ChartBarInteractive = () => {
  return (
    <>
      <CodePreview
        component={<InteractiveCode />}
        filePath='src/app/components/charts/shadcn/bar/code/InteractiveCode.tsx'
        title='Interactive'
      />
    </>
  )
}

export default ChartBarInteractive
