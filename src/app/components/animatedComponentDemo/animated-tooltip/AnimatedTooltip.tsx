import CodePreview from '@/app/components/shared/CodePreview'
import AnimateTooltipMotionCode from './AnimatedTooltipMotion'

export const AnimatedTooltip = () => {
  return (
    <>
      <CodePreview
        component={<AnimateTooltipMotionCode />}
        filePath='src/app/components/animatedComponentDemo/animated-tooltip/AnimatedTooltipMotion.tsx'
        title='Animate Tooltip'
        isAnimated={true}
      />
    </>
  )
}
