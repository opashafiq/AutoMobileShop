import CodePreview from '@/app/components/shared/CodePreview'
import PageImpressionCode from './code/PageImpressionCode'

const ImpressionsChart = () => {
  return (
    <>
      <CodePreview
        component={<PageImpressionCode />}
        filePath='src/app/components/widgets/charts/code/PageImpressionCode.tsx'
        title='Page Impressions Chart'
      />
    </>
  )
}

export default ImpressionsChart
