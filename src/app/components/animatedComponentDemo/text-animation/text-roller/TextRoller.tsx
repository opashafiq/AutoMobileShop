import CodePreview from '@/app/components/shared/CodePreview'
import TextRollerMotionCode from './TextRollerMotion'

export const TextRoller = () => {
  return (
    <>
      <CodePreview
        component={<TextRollerMotionCode />}
        filePath='src/app/components/animatedComponentDemo/text-animation/text-roller/TextRollerMotion.tsx'
        title='Text Roller'
        isAnimated={true}
      />
    </>
  )
}
