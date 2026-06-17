import CodePreview from '@/app/components/shared/CodePreview'
import CarouselMultipleitem from './code/CarouselMultipleItemCode'

const CarouselWithMultipleItem = () => {
  return (
    <>
      <CodePreview
        component={<CarouselMultipleitem />}
        filePath='src/app/components/shadcn-ui/Carousel/code/CarouselMultipleItemCode.tsx'
        title='Carousel With Multiple Item'
      />
    </>
  )
}

export default CarouselWithMultipleItem
