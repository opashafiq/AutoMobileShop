import CodePreview from '@/app/components/shared/CodePreview'
import DotsCode from './code/DotsCode'

const ChartLineDots = () => {
  return (
    <>
      <CodePreview
        component={<DotsCode />}
        filePath='src/app/components/charts/shadcn/line/code/DotsCode.tsx'
        title='Dots'
      />
    </>
  )
}

export default ChartLineDots
