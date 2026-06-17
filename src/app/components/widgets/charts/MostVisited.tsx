import CodePreview from '@/app/components/shared/CodePreview'
import MostVisitedCode from './code/MostVisitedCode'

const VisitChart = () => {
  return (
    <>
      <CodePreview
        component={<MostVisitedCode />}
        filePath='src/app/components/widgets/charts/code/MostVisitedCode.tsx'
        title='Most Visited Chart'
      />
    </>
  )
}

export default VisitChart
