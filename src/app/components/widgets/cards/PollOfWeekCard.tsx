import CodePreview from '@/app/components/shared/CodePreview'
import PollOfWeekCode from './code/PollOfWeekCode'

const PollOfWeek = () => {
  return (
    <>
      <CodePreview
        component={<PollOfWeekCode />}
        filePath='src/app/components/widgets/cards/code/PollOfWeekCode.tsx'
        title='Poll of Week Card'
      />
    </>
  )
}

export default PollOfWeek
