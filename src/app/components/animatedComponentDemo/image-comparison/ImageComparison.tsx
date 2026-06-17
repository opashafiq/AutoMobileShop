import CodePreview from '@/app/components/shared/CodePreview'
import ImageComparisonMotionCode from './ImageComparisonMotion'

export const ImageComparison = () => {
  return (
    <>
      <CodePreview
        component={<ImageComparisonMotionCode />}
        filePath='src/app/components/animatedComponentDemo/image-comparison/ImageComparisonMotion.tsx'
        title='Image Comparison'
        isAnimated={true}
      />
    </>
  )
}
