import CodePreview from '@/app/components/shared/CodePreview'
import MusicCardsCode from './code/MusicCardsCode'

const musicCards = () => {
  return (
    <>
      <CodePreview
        component={<MusicCardsCode />}
        filePath='src/app/components/widgets/cards/code/MusicCardsCode.tsx'
        title='Music Cards'
      />
    </>
  )
}

export default musicCards
