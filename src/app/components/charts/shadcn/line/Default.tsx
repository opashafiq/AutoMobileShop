import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartLineDefault = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/line/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartLineDefault
