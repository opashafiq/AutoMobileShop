import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartRadarDefault = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/radar/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartRadarDefault
