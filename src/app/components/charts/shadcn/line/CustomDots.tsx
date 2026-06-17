import CodePreview from '@/app/components/shared/CodePreview'
import CustomDotsCode from './code/CustomDotsCode'

const ChartLineDotsCustom = () => {
  return (
    <>
      <CodePreview
        component={<CustomDotsCode />}
        filePath='src/app/components/charts/shadcn/line/code/CustomDotsCode.tsx'
        title='Custom Dots'
      />
    </>
  )
}

export default ChartLineDotsCustom
