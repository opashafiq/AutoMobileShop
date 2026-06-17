import CodePreview from '@/app/components/shared/CodePreview'
import SocialCardsCode from './code/SocialCardsCode'

const socialCards = () => {
  return (
    <>
      <CodePreview
        component={<SocialCardsCode />}
        filePath='src/app/components/widgets/cards/code/SocialCardsCode.tsx'
        title='Social Cards'
      />
    </>
  )
}

export default socialCards
