import CodePreview from '@/app/components/shared/CodePreview'
import FeedCardsCode from './code/FeedCardsCode'

const FeedCard = () => {
  return (
    <>
      <CodePreview
        component={<FeedCardsCode />}
        filePath='src/app/components/widgets/cards/code/FeedCardsCode.tsx'
        title='Feed Card'
      />
    </>
  )
}

export default FeedCard
