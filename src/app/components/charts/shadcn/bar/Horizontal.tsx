import CodePreview from '@/app/components/shared/CodePreview'
import HorizontalCode from './code/HorizontalCode'

const ChartBarHorizontal = () => {
  return (
    <>
      <CodePreview
        component={<HorizontalCode />}
        filePath='src/app/components/charts/shadcn/bar/code/HorizontalCode.tsx'
        title='Horizontal'
      />
    </>
  )
}

export default ChartBarHorizontal
