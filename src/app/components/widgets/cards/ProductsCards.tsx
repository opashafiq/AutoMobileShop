import CodePreview from '@/app/components/shared/CodePreview'
import ProductsCardsCode from './code/ProductsCardsCode'

const productCards = () => {
  return (
    <>
      <CodePreview
        component={<ProductsCardsCode />}
        filePath='src/app/components/widgets/cards/code/ProductsCardsCode.tsx'
        title='Product Cards'
      />
    </>
  )
}

export default productCards
