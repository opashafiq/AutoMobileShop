import CodePreview from '@/app/components/shared/CodePreview'
import BlogCardsCode from './code/BlogCardsCode'

const blogCards = () => {
  return (
    <>
      <CodePreview
        component={<BlogCardsCode />}
        filePath='src/app/components/widgets/cards/code/BlogCardsCode.tsx'
        title='Blog Cards'
      />
    </>
  )
}

export default blogCards
