import CodePreview from '@/app/components/shared/CodePreview'
import RecentCommentsCardsCode from './code/RecentCommentsCardsCode'

const RecentComments = () => {
  return (
    <>
      <CodePreview
        component={<RecentCommentsCardsCode />}
        filePath='src/app/components/widgets/cards/code/RecentCommentsCardsCode.tsx'
        title='Recent Comments Card'
      />
    </>
  )
}

export default RecentComments
