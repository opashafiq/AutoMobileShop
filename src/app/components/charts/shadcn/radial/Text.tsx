import CodePreview from '@/app/components/shared/CodePreview'
import TextCode from './code/TextCode'

const ChartRadialText = () => {
  return (
    <>
      <CodePreview
        component={<TextCode />}
        filePath='src/app/components/charts/shadcn/radial/code/TextCode.tsx'
        title='Text'
      />
    </>
  )
}

export default ChartRadialText
