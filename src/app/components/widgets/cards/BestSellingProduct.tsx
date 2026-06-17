import CodePreview from '@/app/components/shared/CodePreview'
import BestSellingProductCode from './code/BestSellingProductCode'

const BestSellingProductCard = () => {
  return (
    <>
      <CodePreview
        component={<BestSellingProductCode />}
        filePath='src/app/components/widgets/cards/code/BestSellingProductCode.tsx'
        title='Best Selling Product Card'
      />
    </>
  )
}

export default BestSellingProductCard
