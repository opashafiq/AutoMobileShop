import CodePreview from '@/app/components/shared/CodePreview'
import GiftCardsCode from './code/GiftCardsCode'

const giftCards = () => {
  return (
    <>
      <CodePreview
        component={<GiftCardsCode />}
        filePath='src/app/components/widgets/cards/code/GiftCardsCode.tsx'
        title='Gift Cards'
      />
    </>
  )
}

export default giftCards
