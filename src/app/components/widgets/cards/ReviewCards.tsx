import CodePreview from '@/app/components/shared/CodePreview'
import ReviewCardsCode from './code/ReviewCardsCode'

const ReviewCards = () => {
  return (
    <>
      <CodePreview
        component={<ReviewCardsCode />}
        filePath='src/app/components/widgets/cards/code/ReviewCardsCode.tsx'
        title='Review Card'
      />
    </>
  )
}

export default ReviewCards
