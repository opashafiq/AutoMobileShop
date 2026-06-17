import CodePreview from '@/app/components/shared/CodePreview'
import TypingAnimationMotionCode from './TypingAnimationMotion'

export const TypingAnimation = () => {
  return (
    <>
      <CodePreview
        component={<TypingAnimationMotionCode />}
        filePath='src/app/components/animatedComponentDemo/text-animation/typing-animation/TypingAnimationMotion.tsx'
        title='Typing Animation'
        isAnimated={true}
      />
    </>
  )
}
