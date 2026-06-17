import CodePreview from '@/app/components/shared/CodePreview'
import ViewsChartCode from './code/ViewsChartCode'

const Views = () => {
  return (
    <>
      <CodePreview
        component={<ViewsChartCode />}
        filePath='src/app/components/widgets/charts/code/ViewsChartCode.tsx'
        title='Views Chart'
      />
    </>
  )
}

export default Views
