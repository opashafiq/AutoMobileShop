import CodePreview from '@/app/components/shared/CodePreview'
import MultipleCode from './code/MultipleCode'

const ChartLineMultiple = () => {
  return (
    <>
      <CodePreview
        component={<MultipleCode />}
        filePath='src/app/components/charts/shadcn/line/code/MultipleCode.tsx'
        title='Multiple'
      />
    </>
  )
}

export default ChartLineMultiple
