import CodePreview from '@/app/components/shared/CodePreview'
import AnimatedTabMotionCode from './AnimatedTabMotion'

export const AnimatedTab = () => {
  return (
    <>
      <CodePreview
        component={<AnimatedTabMotionCode />}
        filePath='src/app/components/animatedComponentDemo/tabs/animated-tab/AnimatedTabMotion.tsx'
        title='Animated Tab'
        isAnimated={true}
      />
    </>
  )
}
