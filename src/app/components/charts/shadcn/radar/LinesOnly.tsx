import CodePreview from '@/app/components/shared/CodePreview'
import LinesOnlyCode from './code/LinesOnlyCode'

const ChartRadarLinesOnly = () => {
  return (
    <>
      <CodePreview
        component={<LinesOnlyCode />}
        filePath='src/app/components/charts/shadcn/radar/code/LinesOnlyCode.tsx'
        title='Lines Only'
      />
    </>
  )
}

export default ChartRadarLinesOnly
