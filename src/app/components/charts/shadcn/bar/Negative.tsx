import CodePreview from '@/app/components/shared/CodePreview'
import NegativeCode from './code/NegativeCode'

const ChartBarNegative = () => {
  return (
    <>
      <CodePreview
        component={<NegativeCode />}
        filePath='src/app/components/charts/shadcn/bar/code/NegativeCode.tsx'
        title='Negative'
      />
    </>
  )
}

export default ChartBarNegative
