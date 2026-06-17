import CodePreview from '@/app/components/shared/CodePreview'
import PollResultCode from './code/PollResultCode'

const PollResult = () => {
  return (
    <>
      <CodePreview
        component={<PollResultCode />}
        filePath='src/app/components/widgets/cards/code/PollResultCode.tsx'
        title='Poll Result Card'
      />
    </>
  )
}

export default PollResult
