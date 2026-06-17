import CodePreview from '@/app/components/shared/CodePreview'
import FlipCardMotionCode from './FlipCardMotion'

export const FlipCard = () => {
  return (
    <>
      <CodePreview
        component={<FlipCardMotionCode />}
        filePath='src/app/components/animatedComponentDemo/cards/filp-card/FlipCardMotion.tsx'
        title='Animate Card'
        isAnimated={true}
      />
    </>
  )
}
