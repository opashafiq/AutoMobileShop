import CodePreview from '@/app/components/shared/CodePreview'
import ProfileCardsCode from './code/ProfileCardsCode'

const profileCards = () => {
  return (
    <>
      <CodePreview
        component={<ProfileCardsCode />}
        filePath='src/app/components/widgets/cards/code/ProfileCardsCode.tsx'
        title='Profile Cards'
      />
    </>
  )
}

export default profileCards
