import CodePreview from '@/app/components/shared/CodePreview'
import MultipleCode from './code/MultipleCode'

const ChartRadarMultiple = () => {
  return (
    <>
      <CodePreview
        component={<MultipleCode />}
        filePath='src/app/components/charts/shadcn/radar/code/MultipleCode.tsx'
        title='Multiple'
      />
    </>
  )
}

export default ChartRadarMultiple
