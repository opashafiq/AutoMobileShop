import CodePreview from '@/app/components/shared/CodePreview'
import DotsColorsCode from './code/DotsColorsCode'

const ChartLineDotsColors = () => {
  return (
    <>
      <CodePreview
        component={<DotsColorsCode />}
        filePath='src/app/components/charts/shadcn/line/code/DotsColorsCode.tsx'
        title='Dots Colors'
      />
    </>
  )
}

export default ChartLineDotsColors
