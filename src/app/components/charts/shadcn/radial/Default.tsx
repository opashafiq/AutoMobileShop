import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartRadialSimple = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/radial/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartRadialSimple
