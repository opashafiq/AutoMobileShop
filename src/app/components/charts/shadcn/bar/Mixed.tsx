import CodePreview from '@/app/components/shared/CodePreview'
import MixedCode from './code/MixedCode'

const ChartBarMixed = () => {
  return (
    <>
      <CodePreview
        component={<MixedCode />}
        filePath='src/app/components/charts/shadcn/bar/code/MixedCode.tsx'
        title='Mixed'
      />
    </>
  )
}

export default ChartBarMixed
