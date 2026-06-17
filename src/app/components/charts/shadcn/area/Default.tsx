import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartAreaDefault = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/area/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartAreaDefault
