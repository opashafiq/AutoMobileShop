import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartPieSimple = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/pie/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartPieSimple
