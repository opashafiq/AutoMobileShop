import CodePreview from '@/app/components/shared/CodePreview'
import RecentMessagesCode from './code/RecentMessagesCode'

const RecentMessages = () => {
  return (
    <>
      <CodePreview
        component={<RecentMessagesCode />}
        filePath='src/app/components/widgets/cards/code/RecentMessagesCode.tsx'
        title='Recent Messages Card'
      />
    </>
  )
}

export default RecentMessages
