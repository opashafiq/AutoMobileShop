import CodePreview from '@/app/components/shared/CodePreview'
import CurrentYearCode from './code/CurrentYearCode'

const currentYear = () => {
  return (
    <>
      <CodePreview
        component={<CurrentYearCode />}
        filePath='src/app/components/widgets/charts/code/CurrentYearCode.tsx'
        title='Current Year Chart'
      />
    </>
  )
}

export default currentYear
