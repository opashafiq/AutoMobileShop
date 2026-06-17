import CodePreview from '@/app/components/shared/CodePreview'
import AnimatedTextBackgroundMotionCode from './AnimatedTextBackgroundMotion'

export const AnimatedTextBackground = () => {
  return (
    <>
      <CodePreview
        component={<AnimatedTextBackgroundMotionCode />}
        filePath='src/app/components/animatedComponentDemo/text-animation/animated-text-background/AnimatedTextBackgroundMotion.tsx'
        title='Animated Gradient Motions'
        isAnimated={true}
      />
    </>
  )
}
