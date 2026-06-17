import CodePreview from '@/app/components/shared/CodePreview'
import MultipleCode from './code/MultipleCode'

const ChartBarMultiple = () => {
  return (
    <>
      <CodePreview
        component={<MultipleCode />}
        filePath='src/app/components/charts/shadcn/bar/code/MultipleCode.tsx'
        title='Multiple'
      />
    </>
  )
}

export default ChartBarMultiple
