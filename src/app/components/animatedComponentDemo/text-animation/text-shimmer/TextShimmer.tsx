import CodePreview from '@/app/components/shared/CodePreview'
import TextShimmerMotionCode from './TextShimmerMotion'

export const TextShimmer = () => {
  return (
    <>
      <CodePreview
        component={<TextShimmerMotionCode />}
        filePath='src/app/components/animatedComponentDemo/text-animation/text-shimmer/TextShimmerMotion.tsx'
        title='Text Shimmer'
        isAnimated={true}
      />
    </>
  )
}
