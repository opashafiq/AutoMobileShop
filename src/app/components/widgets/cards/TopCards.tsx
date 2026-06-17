import CodePreview from '@/app/components/shared/CodePreview'
import TopCardsCode from './code/TopCardsCode'

const topCards = () => {
  return (
    <>
      <CodePreview
        component={<TopCardsCode />}
        filePath='src/app/components/widgets/cards/code/TopCardsCode.tsx'
        title='Top Cards'
      />
    </>
  )
}

export default topCards
